// src/middlewares/validate.ts
import { ZodTypeAny, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

type Parts = { body?: ZodTypeAny; params?: ZodTypeAny; query?: ZodTypeAny };

export const validate = (schemas: Parts) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body)  req.body  = schemas.body.parse(req.body);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ message: 'Validation failed', errors: err.errors });
      }
      next(err);
    }
  };
