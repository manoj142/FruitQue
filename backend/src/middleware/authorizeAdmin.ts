import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { createError } from './errorHandler';

export const authorizeAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(createError('Not authorized to access this resource', 401));
  }

  if (req.user.role !== 'admin') {
    return next(createError('Admin access required', 403));
  }

  next();
};
