import express from 'express';
import { body, param } from 'express-validator';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getBowlProducts,
  getFruitProducts,
  searchProducts,
} from '../controllers/productController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// Validation rules
const createProductValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('productType')
    .isIn(['fruit', 'bowl'])
    .withMessage('Product type must be either fruit or bowl'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('images')
    .isArray({ min: 1 })
    .withMessage('At least one image is required'),
  body('season')
    .optional()
    .isArray()
    .withMessage('Season must be an array'),
  body('isSeasonal')
    .optional()
    .isBoolean()
    .withMessage('isSeasonal must be a boolean'),
  body('isCustomizable')
    .optional()
    .isBoolean()
    .withMessage('isCustomizable must be a boolean'),
  body('hasSubscription')
    .optional()
    .isBoolean()
    .withMessage('hasSubscription must be a boolean'),  body('subProducts')
    .optional()
    .isArray()
    .withMessage('subProducts must be an array')
  // Note: Removed validation for category, unit, stock, minOrderQuantity, maxOrderQuantity as these fields are no longer used in the UI
];

const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('productType')
    .optional()
    .isIn(['fruit', 'bowl'])
    .withMessage('Product type must be either fruit or bowl'),  // Note: Removed validation for category, unit, stock, fruitSeason as these fields are no longer used in the UI
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('isCustomizable')
    .optional()
    .isBoolean()
    .withMessage('isCustomizable must be a boolean'),
  body('hasSubscription')
    .optional()
    .isBoolean()
    .withMessage('hasSubscription must be a boolean'),
  body('subProducts')
    .optional()
    .isArray()
    .withMessage('subProducts must be an array')
];

const productIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID')
];

// Public routes
router.get('/search', searchProducts);
router.get('/bowls', getBowlProducts); // New route for bowl products only
router.get('/fruits', getFruitProducts); // New route for fruit products only
router.get('/', getProducts);
router.get('/:id', productIdValidation, validateRequest, getProduct);

// Admin routes
router.post('/', authenticate, authorize('admin'), createProductValidation, validateRequest, createProduct);
router.put('/:id', authenticate, authorize('admin'), productIdValidation, updateProductValidation, validateRequest, updateProduct);
router.delete('/:id', authenticate, authorize('admin'), productIdValidation, validateRequest, deleteProduct);

export default router;
