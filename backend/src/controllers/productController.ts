import { Request, Response } from 'express';
import Product from '../models/Product';
import { AuthenticatedRequest, ApiResponse, PaginationQuery } from '../types';
import { createError, asyncHandler } from '../middleware/errorHandler';

// @desc    Get all products with filtering and pagination
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 12,
    category,
    subcategory,
    minPrice,
    maxPrice,
    isOrganic,
    isAvailable,
    search,
    sort = '-createdAt',
    tags
  } = req.query as PaginationQuery & {
    category?: string;
    subcategory?: string;
    minPrice?: string;
    maxPrice?: string;
    isOrganic?: string;
    isAvailable?: string;
    tags?: string;
  };

  // Build filter object
  const filter: any = {};

  if (category) filter.category = category;
  if (subcategory) filter.subcategory = subcategory;
  if (isOrganic !== undefined) filter.isOrganic = isOrganic === 'true';
  if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
  
  // Price range filter
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  // Tags filter
  if (tags) {
    const tagArray = tags.split(',').map(tag => tag.trim());
    filter.tags = { $in: tagArray };
  }

  // Search filter
  if (search) {
    filter.$text = { $search: search };
  }

  // Pagination
  const pageNum = parseInt(page.toString()) || 1;
  const limitNum = parseInt(limit.toString()) || 12;
  const skip = (pageNum - 1) * limitNum;

  // Execute query
  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sort.toString())
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(filter)
  ]);

  const response: ApiResponse = {
    success: true,
    message: 'Products retrieved successfully',
    data: {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  };

  res.status(200).json(response);
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw createError('Product not found', 404);
  }

  const response: ApiResponse = {
    success: true,
    message: 'Product retrieved successfully',
    data: { product }
  };

  res.status(200).json(response);
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const product = await Product.create(req.body);

  const response: ApiResponse = {
    success: true,
    message: 'Product created successfully',
    data: { product }
  };

  res.status(201).json(response);
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    throw createError('Product not found', 404);
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  const response: ApiResponse = {
    success: true,
    message: 'Product updated successfully',
    data: { product }
  };

  res.status(200).json(response);
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw createError('Product not found', 404);
  }

  await Product.findByIdAndDelete(req.params.id);

  const response: ApiResponse = {
    success: true,
    message: 'Product deleted successfully'
  };

  res.status(200).json(response);
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const response: ApiResponse = {
    success: true,
    message: 'Categories retrieved successfully',
    data: { categories }
  };

  res.status(200).json(response);
});

// @desc    Get bowl products only
// @route   GET /api/products/bowls
// @access  Public
export const getBowlProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 12,
    search,
    sort = '-createdAt'
  } = req.query as PaginationQuery;

  // Build filter for bowl products only
  const filter: any = { productType: 'bowl', isAvailable: true };

  // Search filter
  if (search) {
    filter.$text = { $search: search };
  }

  // Pagination
  const pageNum = parseInt(page.toString()) || 1;
  const limitNum = parseInt(limit.toString()) || 12;
  const skip = (pageNum - 1) * limitNum;

  // Execute query with population of subProducts
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('subProducts', 'name images fruitSeason')
      .sort(sort.toString())
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(filter)
  ]);

  const response: ApiResponse = {
    success: true,
    message: 'Bowl products retrieved successfully',
    data: {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  };

  res.status(200).json(response);
});

// @desc    Get fruit products only
// @route   GET /api/products/fruits
// @access  Public
export const getFruitProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 12,
    fruitSeason,
    search,
    sort = '-createdAt'
  } = req.query as PaginationQuery & { fruitSeason?: string };

  // Build filter for fruit products only
  const filter: any = { productType: 'fruit', isAvailable: true };

  if (fruitSeason) filter.fruitSeason = fruitSeason;

  // Search filter
  if (search) {
    filter.$text = { $search: search };
  }

  // Pagination
  const pageNum = parseInt(page.toString()) || 1;
  const limitNum = parseInt(limit.toString()) || 12;
  const skip = (pageNum - 1) * limitNum;

  // Execute query
  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sort.toString())
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(filter)
  ]);

  const response: ApiResponse = {
    success: true,
    message: 'Fruit products retrieved successfully',
    data: {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  };

  res.status(200).json(response);
});

// Featured products endpoint removed

// @desc    Get seasonal products
// @route   GET /api/products/seasonal
// @access  Public
export const getSeasonalProducts = asyncHandler(async (req: Request, res: Response) => {
  const currentMonth = new Date().getMonth() + 1;
  let currentSeason = 'year-round';

  // Determine current season based on month
  if (currentMonth >= 3 && currentMonth <= 5) currentSeason = 'spring';
  else if (currentMonth >= 6 && currentMonth <= 8) currentSeason = 'summer';
  else if (currentMonth >= 9 && currentMonth <= 11) currentSeason = 'autumn';
  else currentSeason = 'winter';

  const products = await Product.find({
    isAvailable: true,
    season: { $in: [currentSeason, 'year-round'] }
  })
    .sort({ createdAt: -1 })
    .limit(12)
    .lean();

  const response: ApiResponse = {
    success: true,
    message: 'Seasonal products retrieved successfully',
    data: { products, season: currentSeason }
  };

  res.status(200).json(response);
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
export const searchProducts = asyncHandler(async (req: Request, res: Response) => {
  const { q, page = 1, limit = 12 } = req.query;

  if (!q) {
    throw createError('Search query is required', 400);
  }

  const pageNum = parseInt(page.toString()) || 1;
  const limitNum = parseInt(limit.toString()) || 12;
  const skip = (pageNum - 1) * limitNum;

  const searchQuery = {
    $and: [
      { isAvailable: true },
      {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
          { tags: { $regex: q, $options: 'i' } }
        ]
      }
    ]
  };

  const [products, total] = await Promise.all([
    Product.find(searchQuery)
      .sort({ 'ratings.average': -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(searchQuery)
  ]);

  const response: ApiResponse = {
    success: true,
    message: 'Search results retrieved successfully',
    data: {
      products,
      query: q,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  };

  res.status(200).json(response);
});




// @desc    Get product statistics (Admin only)
// @route   GET /api/admin/products/stats
// @access  Private/Admin
export const getProductStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const totalProducts = await Product.countDocuments();
  const availableProducts = await Product.countDocuments({ isAvailable: true });
  const outOfStockProducts = await Product.countDocuments({ stock: 0 });
  const organicProducts = await Product.countDocuments({ isOrganic: true });
  
  // Count by category
  const categoryStats = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  
  // Count by product type
  const typeStats = await Product.aggregate([
    { $group: { _id: '$productType', count: { $sum: 1 } } }
  ]);

  const response: ApiResponse = {
    success: true,
    message: "Product statistics retrieved successfully",
    data: {
      totalProducts,
      availableProducts,
      outOfStockProducts,
      organicProducts,
      categoryStats,
      typeStats,
      lowStockProducts: await Product.countDocuments({ stock: { $lte: 5, $gt: 0 } })
    }
  };

  return res.status(200).json(response);
});
