import express from 'express';
import { getStore } from '../controllers/storeController';

const router = express.Router();

// Public store routes
router.get('/', getStore);

export default router;
