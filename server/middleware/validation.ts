import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../utils/errorHandler';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        next(new ValidationError(`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`));
      } else {
        next(error);
      }
    }
  };
};

// Common validation patterns
export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  if (page < 1 || limit < 1 || limit > 100) {
    return next(new ValidationError('Invalid pagination parameters'));
  }
  
  req.query.page = page.toString();
  req.query.limit = limit.toString();
  next();
};

export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new ValidationError('No file uploaded'));
  }
  
  // Additional file validation can be added here
  next();
};
