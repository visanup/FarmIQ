// src/middleware/validate.ts
import { AnyZodObject, ZodError, ZodIssue } from 'zod';
import { Request, Response, NextFunction } from 'express';

type Source = 'body' | 'query' | 'params';

export const validate =
  (schema: AnyZodObject, source: Source = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    const data = (req as any)[source];
    const result = schema.safeParse(data);
    if (!result.success) {
      const issues = (result.error as ZodError).issues.map((i: ZodIssue) => ({
        path: i.path.join('.'),
        message: i.message,
      }));
      return res.status(400).json({ message: 'Validation error', issues });
    }
    (req as any)[source] = result.data;
    next();
  };


