// src/middlewares/validation.ts
import { Request, Response, NextFunction } from 'express';
import * as z from 'zod';

/**
 * Request validation middleware
 * @param schema Zod schema to validate against
 * @returns validation middleware
 */
export const validateRequest = (schema: z.Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      } else {
        res.status(500).json({ error: 'Validation failed' });
      }
    }
  };
}