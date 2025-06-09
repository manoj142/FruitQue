import mongoose, { Schema } from 'mongoose';
import { IOrder, IOrderItem, IPaymentDetails, IStatusHistory } from '../types';

const OrderItemSchema = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative']
  },
  image: {
    type: String
  }
}, { _id: false });

const PaymentDetailsSchema = new Schema<IPaymentDetails>({
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  transactionId: String,
  gateway: {
    type: String,
    required: true,
    enum: ['razorpay', 'cod']
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  paidAt: Date
}, { _id: false });

const StatusHistorySchema = new Schema<IStatusHistory>({
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  note: String
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: {
    type: [OrderItemSchema],
    required: true,
    validate: {
      validator: function(items: IOrderItem[]) {
        return items && items.length > 0;
      },
      message: 'Order must contain at least one item'
    }
  },  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'USA' },
    firstName: String,
    lastName: String,
    email: String,
    phone: String
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    firstName: String,
    lastName: String,
    email: String,
    phone: String
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['razorpay', 'cod']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDetails: PaymentDetailsSchema,
  orderStatus: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },
  statusHistory: {
    type: [StatusHistorySchema],
    default: function() {
      return [{ status: this.orderStatus, timestamp: new Date() }];
    }
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    tax: {
      type: Number,
      required: true,
      min: [0, 'Tax cannot be negative'],
      default: 0
    },
    shippingFee: {
      type: Number,
      required: true,
      min: [0, 'Shipping fee cannot be negative'],
      default: 0
    },
    discount: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      default: 0
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    }
  },
  estimatedDelivery: Date,
  actualDelivery: Date,
  trackingNumber: String,
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ createdAt: -1 });

// Pre-save middleware to generate order number
OrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `FM${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual for order age
OrderSchema.virtual('orderAge').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Instance method to add status history
OrderSchema.methods.updateStatus = function(newStatus: string, note?: string) {
  this.orderStatus = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note
  });
  return this.save();
};

// Static method to find orders by user
OrderSchema.statics.findByUser = function(userId: string) {
  return this.find({ user: userId })
    .populate('items.product')
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

// Static method to find orders by status
OrderSchema.statics.findByStatus = function(status: string) {
  return this.find({ orderStatus: status })
    .populate('items.product')
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

const Order = mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
