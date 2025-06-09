import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  _id: string;
  customerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  name: string;
  type: 'weekly' | 'biweekly' | 'monthly';
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  items: Array<{
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  startDate: Date;
  endDate: Date;
  nextDeliveryDate: Date;
  lastDeliveryDate?: Date;
  paymentMethod: string;
  deliveryInstructions?: string;
  createdBy?: mongoose.Types.ObjectId; // Admin who created it
  createdAt: Date;
  updatedAt: Date;
  calculateNextDeliveryDate(): Date | null;
  calculateEndDate(): Date;
  isDueForDelivery(): boolean;
}

const subscriptionSchema = new Schema<ISubscription>({
  customerDetails: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, default: 'India', trim: true }
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'expired'],
    default: 'active'
  },
  items: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  nextDeliveryDate: {
    type: Date,
    required: true
  },
  lastDeliveryDate: {
    type: Date
  },  endDate: {
    type: Date,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'cod'
  },
  deliveryInstructions: {
    type: String,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
subscriptionSchema.index({ 'customerDetails.email': 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ type: 1 });
subscriptionSchema.index({ nextDeliveryDate: 1 });
subscriptionSchema.index({ createdAt: -1 });

// Virtual to populate product details
subscriptionSchema.virtual('itemDetails', {
  ref: 'Product',
  localField: 'items.product',
  foreignField: '_id'
});

// Method to calculate next delivery date (daily deliveries within subscription period)
subscriptionSchema.methods.calculateNextDeliveryDate = function() {
  const currentDate = this.lastDeliveryDate || this.startDate;
  const nextDate = new Date(currentDate);
  
  // For daily deliveries, simply add 1 day
  nextDate.setDate(nextDate.getDate() + 1);
  
  // Ensure we don't exceed the subscription end date
  if (nextDate > this.endDate) {
    return null; // Subscription has ended
  }
  
  return nextDate;
};

// Method to calculate subscription end date based on type
subscriptionSchema.methods.calculateEndDate = function() {
  const startDate = new Date(this.startDate);
  const endDate = new Date(startDate);
  
  switch (this.type) {
    case 'weekly':
      endDate.setDate(endDate.getDate() + 7);
      break;
    case 'biweekly':
      endDate.setDate(endDate.getDate() + 14);
      break;
    case 'monthly':
      endDate.setDate(endDate.getDate() + 30);
      break;
  }
  
  return endDate;
};

// Method to check if subscription is due for delivery
subscriptionSchema.methods.isDueForDelivery = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const deliveryDate = new Date(this.nextDeliveryDate);
  deliveryDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(this.endDate);
  endDate.setHours(0, 0, 0, 0);
  
  // Check if delivery is due and subscription hasn't ended
  return deliveryDate <= today && this.status === 'active' && today <= endDate;
};

// Static method to get active subscriptions due for delivery
subscriptionSchema.statics.getDueSubscriptions = function() {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  
  return this.find({
    status: 'active',
    nextDeliveryDate: { $lte: today },
    endDate: { $gte: today } // Only include subscriptions that haven't ended
  }).populate('items.product');
};

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema);
