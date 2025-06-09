import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUser, IAddress, IUserPreferences } from '../types';

const AddressSchema = new Schema<IAddress>({
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    required: true
  },
  street: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
  },
  country: {
    type: String,
    required: true,
    default: 'India'
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const UserPreferencesSchema = new Schema<IUserPreferences>({
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true }
  },
  dietary: [{ type: String }],
  allergies: [{ type: String }]
});

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  address: [AddressSchema],
  preferences: UserPreferencesSchema,
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });
UserSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Ensure only one default address per user
UserSchema.pre('save', function (next) {
  if (this.address && this.address.length > 0) {
    const defaultAddresses = this.address.filter(addr => addr.isDefault);
    if (defaultAddresses.length > 1) {
      // Keep only the first default address
      this.address.forEach((addr, index) => {
        if (index > 0 && addr.isDefault) {
          addr.isDefault = false;
        }
      });
    }
  }
  next();
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate JWT token
UserSchema.methods.generateAuthToken = function (): string {
  const payload = { id: this._id, email: this.email, role: this.role };
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  const options = { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions;
  
  return jwt.sign(payload, secret, options);
};

// Virtual for full address
UserSchema.virtual('defaultAddress').get(function () {
  return this.address?.find(addr => addr.isDefault) || this.address?.[0];
});

export default mongoose.model<IUser>('User', UserSchema);
