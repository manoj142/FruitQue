import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthenticatedRequest } from '../types';
import { createError, asyncHandler } from './errorHandler';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export const authenticate = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(createError('Not authorized to access this resource', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as JwtPayload;

    // Get user from database
    const user = await User.findById(decoded.id).select('+password');
    
    if (!user) {
      return next(createError('User not found', 401));
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return next(createError('Not authorized to access this resource', 401));
  }
});

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('Not authorized to access this resource', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError(`Role ${req.user.role} is not authorized to access this resource`, 403));
    }

    next();
  };
};

export const optionalAuth = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as JwtPayload;
      const user = await User.findById(decoded.id);
      
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Continue without user if token is invalid
    }
  }

  next();
});

export const requireEmailVerification = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(createError('Not authorized to access this resource', 401));
  }

  if (!req.user.isEmailVerified) {
    return next(createError('Please verify your email to access this resource', 403));
  }

  next();
};
