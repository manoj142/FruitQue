import { Response } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { sendEmail } from '../utils/email';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, email, password, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError('User already exists with this email', 400);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone
  });

  // Generate email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = emailVerificationToken;
  await user.save();

  // Send verification email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email - FruitBowl',
      template: 'emailVerification',
      data: {
        name: user.name,
        verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`
      }
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
  }

  // Generate JWT token
  const token = user.generateAuthToken();

  // Set cookie
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const
  };

  res.cookie('token', token, cookieOptions);

  const response: ApiResponse = {
    success: true,
    message: 'User registered successfully. Please check your email for verification.',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      },
      token
    }
  };

  res.status(201).json(response);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    throw createError('Please provide email and password', 400);
  }

  // Check if user exists and get password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw createError('Invalid credentials:User not existed', 401);
  }

  // Check if password matches
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw createError('Invalid credentials:Password didnt match', 401);
  }

  // Generate JWT token
  const token = user.generateAuthToken();

  // Set cookie
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const
  };

  res.cookie('token', token, cookieOptions);

  const response: ApiResponse = {
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar
      },
      token
    }
  };

  res.status(200).json(response);
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.cookie('token', '', {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const
  });

  const response: ApiResponse = {
    success: true,
    message: 'Logout successful'
  };

  res.status(200).json(response);
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  const response: ApiResponse = {
    success: true,
    message: 'User profile retrieved successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
        address: user.address,
        preferences: user.preferences
      }
    }
  };

  res.status(200).json(response);
});

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { token } = req.body;

  if (!token) {
    throw createError('Verification token is required', 400);
  }

  const user = await User.findOne({ emailVerificationToken: token });
  if (!user) {
    throw createError('Invalid or expired verification token', 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save();

  const response: ApiResponse = {
    success: true,
    message: 'Email verified successfully'
  };

  res.status(200).json(response);
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw createError('User not found with this email', 404);
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  await user.save();

  // Send reset email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset - FruitBowl',
      template: 'passwordReset',
      data: {
        name: user.name,
        resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Password reset link sent to your email'
    };

    res.status(200).json(response);
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    throw createError('Email could not be sent', 500);
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw createError('Token and password are required', 400);
  }

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw createError('Invalid or expired reset token', 400);
  }

  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Generate new JWT token
  const authToken = user.generateAuthToken();

  // Set cookie
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const
  };

  res.cookie('token', authToken, cookieOptions);

  const response: ApiResponse = {
    success: true,
    message: 'Password reset successful',
    data: {
      token: authToken
    }
  };

  res.status(200).json(response);
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user!._id).select('+password');

  if (!user) {
    throw createError('User not found', 404);
  }

  // Check current password
  const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordCorrect) {
    throw createError('Current password is incorrect', 400);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  const response: ApiResponse = {
    success: true,
    message: 'Password changed successfully'
  };

  res.status(200).json(response);
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, email, phone, address } = req.body;
  const user = await User.findById(req.user!._id);

  if (!user) {
    throw createError('User not found', 404);
  }

  // Check if email is being changed and if it already exists
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError('Email already exists', 400);
    }
    user.email = email;
    user.isEmailVerified = false; // Reset email verification if email is changed
  }
  // Update fields
  if (name) user.name = name;
  if (phone) user.phone = phone;
  
  // Handle address - maintain backward compatibility
  if (address) {
    // If we get a string, create or update the simple address field
    if (typeof address === 'string') {
      // For backward compatibility with simple string addresses
      user.address = [{
        type: 'home',
        street: address,
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        isDefault: true
      }];
    } else if (Array.isArray(address)) {
      // If we get an array of address objects, use that
      user.address = address;
    }
  }

  await user.save();

  const response: ApiResponse = {
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
        address: user.address,
        preferences: user.preferences
      }
    }
  };

  res.status(200).json(response);
});
