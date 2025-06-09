import express from 'express';
import {
  createSubscription,
  getAllSubscriptions,
  getUserSubscriptions,
  getSubscriptionById,
  updateSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  deleteSubscription,
  getDueSubscriptions,
  getSubscriptionStats,
  completeDelivery,
  checkExpiredSubscriptions
} from '../controllers/subscriptionController';
import { authenticate } from '../middleware/auth';
import { authorizeAdmin } from '../middleware/authorizeAdmin';

const router = express.Router();

// Public routes (none for subscriptions)

// Protected routes (require authentication)
router.use(authenticate);

// User routes
router.get('/my-subscriptions', getUserSubscriptions);
router.get('/:id', getSubscriptionById);
router.put('/:id', updateSubscription);
router.patch('/:id/pause', pauseSubscription);
router.patch('/:id/resume', resumeSubscription);
router.patch('/:id/cancel', cancelSubscription);

// Admin routes
router.post('/create', authorizeAdmin, createSubscription);
router.get('/', authorizeAdmin, getAllSubscriptions);
router.get('/admin/due', authorizeAdmin, getDueSubscriptions);
router.get('/admin/stats', authorizeAdmin, getSubscriptionStats);
router.patch('/:id/complete-delivery', authorizeAdmin, completeDelivery);
router.patch('/admin/check-expired', authorizeAdmin, checkExpiredSubscriptions);
router.delete('/:id', authorizeAdmin, deleteSubscription);

export default router;
