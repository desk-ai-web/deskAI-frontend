import { Request, Response, NextFunction } from 'express';
import logger from '../logger';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends CustomError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string = 'Too many requests') {
    super(message, 429);
  }
}

// Error response formatter
export const formatErrorResponse = (error: AppError) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    message: error.message || 'Internal Server Error',
    ...(isDevelopment && { stack: error.stack }),
    ...(isDevelopment && { details: error }),
  };
};

// Centralized error handler middleware
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // Handle specific error types
  if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation error';
  } else if (error.name === 'MulterError') {
    statusCode = 400;
    message = 'File upload error';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log error
  logger.error(`${req.method} ${req.path} - ${statusCode}: ${message}`, {
    error: error.stack,
    url: req.url,
    method: req.method,
    ip: req.realIP || 'unknown',
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
  });

  // Send error response
  res.status(statusCode).json(formatErrorResponse({ ...error, statusCode, message }));
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Error logger utility
export const logError = (error: Error, context?: string) => {
  logger.error(`${context ? `[${context}] ` : ''}${error.message}`, {
    error: error.stack,
    context,
  });
};

// Success response formatter
export const formatSuccessResponse = (data: any, message?: string) => ({
  success: true,
  message: message || 'Operation successful',
  data,
});
