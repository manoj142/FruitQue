import mongoose, { Document, Schema } from 'mongoose';

export interface IStore extends Document {
  name: string;
  location: string;
  contact: string;
  email: string;
  instagram?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
      maxlength: [100, 'Store name cannot exceed 100 characters']
    },
    location: {
      type: String,
      required: [true, 'Store location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters']
    },
    contact: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid contact number']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    instagram: {
      type: String,
      trim: true,
      maxlength: [100, 'Instagram handle cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Ensure only one active store at a time
StoreSchema.pre('save', async function(next) {
  if (this.isNew && this.isActive) {
    await mongoose.model('Store').updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

// Index for better performance
StoreSchema.index({ isActive: 1 });

const Store = mongoose.model<IStore>('Store', StoreSchema);

export default Store;
