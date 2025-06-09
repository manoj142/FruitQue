import { Request } from 'express';
import { Document, Types } from 'mongoose';

// User Types
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin';
  address?: IAddress[];
  preferences?: IUserPreferences;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
}

export interface IAddress {
  _id?: Types.ObjectId;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isDefault: boolean;
}

export interface IUserPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  dietary: string[];
  allergies: string[];
}

// Product Types
export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  productType: 'fruit' | 'bowl'; // New field to distinguish product types
  category?: string;
  subcategory?: string;
  price: number; // Required for both fruit and bowl
  originalPrice?: number;
  discount?: number;
  images: string[];
  unit?: string;
  weight?: number;
  nutritionalInfo?: INutritionalInfo;
  origin?: string;
  stock?: number;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  isOrganic?: boolean;
  isAvailable?: boolean;
  tags?: string[];
  ratings?: {
    average: number;
    count: number;
  };
  // Season field - replaces fruitSeason, used for both fruit and bowl
  season?: string[];
  isSeasonal?: boolean;  // Bowl-specific fields (for productType: 'bowl')
  isCustomizable?: boolean;
  hasSubscription?: boolean;
  subProducts?: Types.ObjectId[]; // Array of fruit product IDs for bowls
  maxSubProducts?: number; // Maximum number of subproducts that can be selected for customizable bowls
  createdAt: Date;
  updatedAt: Date;
}

export interface INutritionalInfo {
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  vitamins?: string[];
  minerals?: string[];
}

// Cart Types
export interface ICartItem {
  product: Types.ObjectId | IProduct;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface ICart extends Document {
  user: Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  totalItems: number;
  updatedAt: Date;
}

// Order Types
export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  user: Types.ObjectId | IUser;
  items: IOrderItem[];
  shippingAddress: IAddress;
  billingAddress?: IAddress;
  paymentMethod: 'razorpay' | 'cod';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDetails?: IPaymentDetails;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  statusHistory: IStatusHistory[];
  pricing: {
    subtotal: number;
    tax: number;
    shippingFee: number;
    discount: number;
    total: number;
  };
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  product: Types.ObjectId | IProduct;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  image?: string;
}

export interface IPaymentDetails {
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  transactionId?: string;
  gateway: string;
  amount: number;
  currency: string;
  paidAt?: Date;
}

export interface IStatusHistory {
  status: string;
  timestamp: Date;
  note?: string;
}

// Review Types
export interface IReview extends Document {
  user: Types.ObjectId | IUser;
  product: Types.ObjectId | IProduct;
  order: Types.ObjectId | IOrder;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  helpful: number;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

// Request Extensions
export interface AuthenticatedRequest extends Request {
  user?: IUser;
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

// Category Types
export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  subcategories?: ISubcategory[];
  isActive: boolean;
}

export interface ISubcategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

// Analytics Types
export interface IAnalytics {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  recentOrders: IOrder[];
  topProducts: Array<{
    product: IProduct;
    sales: number;
    revenue: number;
  }>;
  salesData: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
}

// Notification Types
export interface INotification extends Document {
  user: Types.ObjectId;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'system' | 'reminder';
  isRead: boolean;
  data?: any;
  createdAt: Date;
}

// Coupon Types
export interface ICoupon extends Document {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  applicableProducts?: Types.ObjectId[];
  applicableCategories?: string[];
  createdAt: Date;
  updatedAt: Date;
}
