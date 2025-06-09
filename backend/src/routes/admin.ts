import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { 
  getAllUsers, 
  getUserById, 
  updateUserRole, 
  deleteUser, 
  getUserStats,
  createUser,
  updateUser
} from '../controllers/userController';
import { getProductStats } from '../controllers/productController';
import { getOrderStats } from '../controllers/orderController';
import { getStoreAdmin, createOrUpdateStore, deleteStore } from '../controllers/storeController';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// User management routes
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.get('/users/stats', getUserStats);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Product management routes
router.get('/products/stats', getProductStats);

// Order management routes
router.get('/orders/stats', getOrderStats);

// Store management routes
router.get('/store', getStoreAdmin);
router.post('/store', createOrUpdateStore);
router.delete('/store/:id', deleteStore);

router.get('/orders', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get all orders endpoint - to be implemented'
  });
});

router.put('/orders/:id/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Update order status endpoint - to be implemented'
  });
});

export default router;
