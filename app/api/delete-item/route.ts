import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LostItem from '@/models/LostItem';
import OTP from '@/models/OTP';

export async function DELETE(request: Request) {
  await dbConnect();

  try {
    const { itemId, otp, email } = await request.json();
    if (!itemId || !otp || !email) {
      return NextResponse.json(
        { success: false, error: 'Item ID, OTP, and email are required' },
        { status: 400 }
      );
    }

    const otpRecord = await OTP.findOneAndDelete({ email });
    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: 'OTP not found or expired' },
        { status: 400 }
      );
    }

    if (otpRecord.otp !== otp) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json(
        { success: false, error: 'OTP has expired' },
        { status: 400 }
      );
    }

    const deletedItem = await LostItem.findOneAndDelete({
      _id: itemId,
      contactEmail: email
    });

    if (!deletedItem) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Item not found or you are not authorized to delete it' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Item deleted successfully',
        deletedItemId: deletedItem._id 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}