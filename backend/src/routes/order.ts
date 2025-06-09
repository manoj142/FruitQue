import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  verifyPayment,
  getOrderStats
} from '../controllers/orderController';

const router = express.Router();

// Get user orders with pagination and filtering
router.get('/user', authenticate, getUserOrders);

// Get order statistics
router.get('/stats', authenticate, getOrderStats);

// Get single order by ID
router.get('/:orderId', authenticate, getOrderById);

// Create new order
router.post('/', authenticate, createOrder);

// Update order status
router.patch('/:orderId/status', authenticate, updateOrderStatus);

// Cancel order
router.patch('/:orderId/cancel', authenticate, cancelOrder);

// Verify payment (for Razorpay)
router.post('/payment/verify', authenticate, verifyPayment);

export default router;
