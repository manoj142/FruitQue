import { Request, Response } from 'express';
import User from '../models/User';

// Extend Request interface to include user property
interface AuthenticatedRequest extends Request {
  user?: any;
}

// Get all users (Admin only)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const role = req.query.role as string || '';

    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }

    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .select('-password -passwordResetToken -emailVerificationToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -passwordResetToken -emailVerificationToken');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Create new user (Admin only)
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, role, password, isEmailVerified } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Create new user (password will be automatically hashed by the User model pre-save middleware)
    const user = new User({
      name,
      email,
      phone,
      role: role || 'user',
      password, // Don't hash here - let the model handle it
      isEmailVerified: isEmailVerified || false
    });

    await user.save();// Remove password from response
    const userResponse = user.toObject();
    const { password: _, passwordResetToken, emailVerificationToken, ...safeUserResponse } = userResponse;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: safeUserResponse }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Update user (Admin only)
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const { name, email, phone, role, isEmailVerified } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
        return;
      }
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (role && ['user', 'admin'].includes(role)) user.role = role;
    if (isEmailVerified !== undefined) user.isEmailVerified = isEmailVerified;

    await user.save();    // Remove sensitive data from response
    const userResponse = user.toObject();
    const { password: __, passwordResetToken, emailVerificationToken, ...safeUserResponse } = userResponse;

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user: safeUserResponse }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Update user role (Admin only)
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    if (!['user', 'admin'].includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "user" or "admin"'
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password -passwordResetToken -emailVerificationToken');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Delete user (Admin only)
export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.user?._id.toString()) {
      res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
      return;
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Get user statistics
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isEmailVerified: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        adminUsers,
        newUsersThisMonth,
        inactiveUsers: totalUsers - activeUsers
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};
