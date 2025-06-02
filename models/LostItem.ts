import mongoose, { Document, Schema } from 'mongoose';

export interface ILostItem extends Document {
  title: string;
  description: string;
  category: string;
  location: string;
  date: Date;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  image: string;
  status: 'lost' | 'found';
  createdAt: Date;
  updatedAt: Date;
}

const LostItemSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Electronics', 'Books', 'Clothing', 'Accessories', 'Documents', 'Sports Equipment', 'Other']
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters']
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now
    },
    contactName: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
      maxlength: [50, 'Contact name cannot exceed 50 characters']
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
      match: [/^\+91\s?\d{10}$/, 'Please enter a valid Indian phone number']
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    image: {
      type: String,
      default: '/placeholder.svg?height=200&width=300'
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['lost', 'found'],
      default: 'lost'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

LostItemSchema.index({ title: 'text', description: 'text', location: 'text' });
LostItemSchema.index({ category: 1 });
LostItemSchema.index({ status: 1 });
LostItemSchema.index({ createdAt: -1 });

export default mongoose.models.LostItem || mongoose.model<ILostItem>('LostItem', LostItemSchema);