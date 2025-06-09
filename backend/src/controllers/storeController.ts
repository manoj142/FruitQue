import { Request, Response } from 'express';
import Store from '../models/Store';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { createError, asyncHandler } from '../middleware/errorHandler';

// @desc    Get store details
// @route   GET /api/store
// @access  Public
export const getStore = asyncHandler(async (req: Request, res: Response) => {
  const store = await Store.findOne({ isActive: true });
  
  if (!store) {
    throw createError('No active store found', 404);
  }

  const response: ApiResponse = {
    message: 'Store details fetched successfully',
    success: true,
    data: { store }
  };

  return res.status(200).json(response);
});

// @desc    Get store details for admin
// @route   GET /api/admin/store
// @access  Private/Admin
export const getStoreAdmin = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const store = await Store.findOne({ isActive: true });

  const response: ApiResponse = {
    message: 'Store details fetched successfully',
    success: true,
    data: { store }
  };

  return res.status(200).json(response);
});

// @desc    Create or update store
// @route   POST /api/admin/store
// @access  Private/Admin
export const createOrUpdateStore = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, location, contact, email, instagram, description } = req.body;

  // Validation
  if (!name || !location || !contact || !email) {
    throw createError('Name, location, contact, and email are required', 400);
  }

  // Check if there's an existing active store
  const existingStore = await Store.findOne({ isActive: true });

  let store;
  if (existingStore) {
    // Update existing store
    store = await Store.findByIdAndUpdate(
      existingStore._id,
      {
        name,
        location,
        contact,
        email,
        instagram,
        description
      },
      { new: true, runValidators: true }
    );
  } else {
    // Create new store
    store = await Store.create({
      name,
      location,
      contact,
      email,
      instagram,
      description,
      isActive: true
    });
  }

  const response: ApiResponse = {
    success: true,
    message: existingStore ? 'Store updated successfully' : 'Store created successfully',
    data: { store }
  };

  return res.status(existingStore ? 200 : 201).json(response);
});

// @desc    Delete store
// @route   DELETE /api/admin/store/:id
// @access  Private/Admin
export const deleteStore = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const store = await Store.findById(req.params.id);

  if (!store) {
    throw createError('Store not found', 404);
  }

  await Store.findByIdAndDelete(req.params.id);

  const response: ApiResponse = {
    success: true,
    message: 'Store deleted successfully'
  };

  return res.status(200).json(response);
});
