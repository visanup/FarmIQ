// src/middleware/apiKey.ts

import { Request, Response, NextFunction } from 'express';
import { SERVICE_API_KEY, REQUIRE_API_KEY } from '../configs/config';

export function apiKey(req: Request, res: Response, next: NextFunction) {
  // dev: ถ้าไม่ enforce หรือไม่มี key → ปล่อยผ่าน
  if (!REQUIRE_API_KEY || !SERVICE_API_KEY) return next();

  const key = (req.header('x-api-key') || req.query.api_key) as string | undefined;
  if (!key || key !== SERVICE_API_KEY) return res.status(401).json({ error: 'Unauthorized' });
  return next();
}

