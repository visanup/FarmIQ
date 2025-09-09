// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Global error handler middleware
 * @param err Error object
 * @param req Express request
 * @param res Express response
 * @param next Express next function
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`❌ Error in ${req.method} ${req.path}:`, err);
  
  // Set default error status and message
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  // Send response
  res.status(status).json({
    error: message,
    // Show stack trace only in development
    stack: process.env.ENV === 'dev' ? err.stack : undefined
  });
};