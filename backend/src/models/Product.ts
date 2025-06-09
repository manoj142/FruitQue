import mongoose, { Schema } from 'mongoose';
import { IProduct, INutritionalInfo } from '../types';

const NutritionalInfoSchema = new Schema<INutritionalInfo>({
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbohydrates: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  fiber: { type: Number, default: 0 },
  sugar: { type: Number, default: 0 },
  vitamins: [{ type: String }],
  minerals: [{ type: String }]
});

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  productType: {
    type: String,
    required: [true, 'Product type is required'],
    enum: ['fruit', 'bowl'],
    lowercase: true
  },  category: {
    type: String,
    enum: ['fruits', 'vegetables', 'herbs', 'exotic', 'organic', 'seasonal', 'bowls'],
    lowercase: true,
    required: false
  },
  subcategory: {
    type: String,
    trim: true,
    required: false
  },
  // Price validation: required for bowl, can be 0 for fruit
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: function(this: any, value: number) {
        // For bowl products, price must be greater than 0
        if (this.productType === 'bowl') {
          return value > 0;
        }
        // For fruit products, price can be 0 (not sold directly)
        return value >= 0;
      },
      message: 'Price must be greater than 0 for bowl products'
    }
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot be more than 100%'],
    default: 0
  },
  images: {
    type: [String],
    required: [true, 'At least one image is required'],
    validate: {
      validator: function(v: string[]) {
        return v && v.length > 0;
      },
      message: 'At least one image is required'
    }
  },  unit: {
    type: String,
    enum: ['kg', 'g', 'piece', 'dozen', 'bunch', 'packet'],
    lowercase: true,
    required: false
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative'],
    required: false
  },
  nutritionalInfo: NutritionalInfoSchema,
  origin: {
    type: String,
    trim: true
  },
  // Season field - replaces fruitSeason, used for both fruit and bowl
  season: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isSeasonal: {
    type: Boolean,
    default: false
  },
  // Bowl-specific fields (for productType: 'bowl')
  isCustomizable: {
    type: Boolean,
    default: false
  },
  hasSubscription: {
    type: Boolean,
    default: false
  },  subProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
    validate: {
      validator: function(this: any) {
        // Only bowl products can have subproducts
        return this.productType === 'bowl' || !this.subProducts || this.subProducts.length === 0;
      },
      message: 'Only bowl products can have subproducts'
    }
  }],
  // Maximum number of subproducts that can be selected for customizable bowls
  maxSubProducts: {
    type: Number,
    default: 5,
    min: [1, 'Maximum subproducts must be at least 1'],
    validate: {
      validator: function(this: any, value: number) {
        // Only required for customizable bowl products
        return this.productType !== 'bowl' || !this.isCustomizable || value > 0;
      },
      message: 'Maximum subproducts is required for customizable bowls'
    }
  },stock: {
    type: Number,
    min: [0, 'Stock cannot be negative'],
    required: false,
    default: 0
  },
  minOrderQuantity: {
    type: Number,
    default: 1,
    min: [1, 'Minimum order quantity must be at least 1']
  },
  maxOrderQuantity: {
    type: Number,
    default: 100,
    min: [1, 'Maximum order quantity must be at least 1']
  },  isOrganic: {
    type: Boolean,
    default: false,
    required: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, subcategory: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ 'ratings.average': -1 });
ProductSchema.index({ isAvailable: 1, stock: 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ createdAt: -1 });

// Virtual for discounted price
ProductSchema.virtual('discountedPrice').get(function () {
  if (this.discount && this.discount > 0) {
    return this.price - (this.price * this.discount / 100);
  }
  return this.price;
});

// Virtual for stock status
ProductSchema.virtual('stockStatus').get(function () {
  const stock = this.stock || 0;
  if (stock === 0) return 'out-of-stock';
  if (stock <= 10) return 'low-stock';
  return 'in-stock';
});

// Virtual for availability status
ProductSchema.virtual('availabilityStatus').get(function () {
  const stock = this.stock || 0;
  const isAvailable = this.isAvailable !== false; // default to true
  return isAvailable && stock > 0;
});

// Pre-save middleware to calculate original price if discount is provided
ProductSchema.pre('save', function (next) {
  if (this.discount && this.discount > 0 && !this.originalPrice) {
    this.originalPrice = this.price;
    this.price = this.price - (this.price * this.discount / 100);
  }
  next();
});

// Validation for max order quantity should be greater than min order quantity
ProductSchema.pre('save', function (next) {
  const minOrder = this.minOrderQuantity || 1;
  const maxOrder = this.maxOrderQuantity || 100;
  if (maxOrder < minOrder) {
    next(new Error('Maximum order quantity must be greater than or equal to minimum order quantity'));
  }
  next();
});

export default mongoose.model<IProduct>('Product', ProductSchema);
