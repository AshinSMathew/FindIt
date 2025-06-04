import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  createdAt: Date;
}

const OTPSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'is invalid'],
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '5m' },
  },
}, {
  timestamps: true,
});

OTPSchema.index({ email: 1, otp: 1 }, { unique: true });

export default mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema);