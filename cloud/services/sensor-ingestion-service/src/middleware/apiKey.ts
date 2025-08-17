// src/middleware/apiKey.ts

import { Request, Response, NextFunction } from 'express';
import { ADMIN_API_KEY } from '../configs/config';

export function apiKey(req: Request, res: Response, next: NextFunction) {
  if (!ADMIN_API_KEY) return res.status(500).json({ error: 'Server missing ADMIN_API_KEY' });
  const key = req.header('x-api-key') || req.query.api_key;
  if (key !== ADMIN_API_KEY) return res.status(401).json({ error: 'invalid api key' });
  return next();
}
