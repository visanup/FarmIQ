// src/middleware/apiKey.ts

import { Request, Response, NextFunction } from 'express';
import { API_KEY } from '../configs/config';

export function apiKey(req: Request, res: Response, next: NextFunction) {
  const key = req.header('x-api-key') || req.query.api_key;
  if (!API_KEY) return res.status(500).json({ error: 'Service misconfigured: API_KEY missing' });
  if (!key || key !== API_KEY) return res.status(401).json({ error: 'Unauthorized' });
  return next();
}