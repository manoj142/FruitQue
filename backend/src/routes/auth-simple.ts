import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Simple routes without validation for testing
router.post('/register-simple', register);
router.post('/login-simple', login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
