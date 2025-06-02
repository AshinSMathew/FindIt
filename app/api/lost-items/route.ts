import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import LostItem from '../../../models/LostItem';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    let query: any = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (category !== 'all') {
      query.category = category;
    }

    if (status !== 'all') {
      query.status = status;
    }

    const items = await LostItem.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await LostItem.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error('GET /api/lost-items error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch items',
        message: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Parse the form data
    const formData = await request.formData();
    
    // Extract text fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const location = formData.get('location') as string;
    const contactName = formData.get('contactName') as string;
    const contactPhone = formData.get('contactPhone') as string;
    const contactEmail = formData.get('contactEmail') as string;
    const status = formData.get('status') as 'lost' | 'found';
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'category', 'location', 'contactName', 'contactPhone', 'status'];
    const missingFields = requiredFields.filter(field => !formData.get(field));
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          missingFields
        },
        { status: 400 }
      );
    }

    // Handle image upload
    let imageUrl = '/placeholder.svg?height=200&width=300';
    const imageFile = formData.get('image') as File | null;

    if (imageFile && imageFile.size > 0) {
      // Check file size (4MB limit)
      if (imageFile.size > 4 * 1024 * 1024) {
        return NextResponse.json(
          {
            success: false,
            error: 'Image size must be less than 4MB'
          },
          { status: 400 }
        );
      }

      // Convert file to buffer
      const buffer = await imageFile.arrayBuffer();
      const base64String = Buffer.from(buffer).toString('base64');
      const dataUri = `data:${imageFile.type};base64,${base64String}`;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'lost-and-found',
        resource_type: 'auto',
      });

      imageUrl = result.secure_url;
    }

    // Create new item
    const newItem = new LostItem({
      title,
      description,
      category,
      location,
      contactName,
      contactPhone,
      contactEmail: contactEmail || '',
      status,
      date: new Date(),
      image: imageUrl
    });

    const savedItem = await newItem.save();

    return NextResponse.json(
      {
        success: true,
        data: savedItem,
        message: 'Item reported successfully'
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('POST /api/lost-items error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          validationErrors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create item',
        message: error.message
      },
      { status: 500 }
    );
  }
}