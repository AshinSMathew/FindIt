import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import LostItem from '../../../models/LostItem';

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

    const body = await request.json();
    const requiredFields = ['title', 'description', 'category', 'location', 'contactName', 'contactPhone', 'status'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
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

    const newItem = new LostItem({
      title: body.title,
      description: body.description,
      category: body.category,
      location: body.location,
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      contactEmail: body.contactEmail || '',
      status: body.status,
      date: body.date ? new Date(body.date) : new Date(),
      image: body.image || '/placeholder.svg?height=200&width=300'
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