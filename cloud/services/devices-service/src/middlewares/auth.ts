// services/data-service/src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt, { VerifyErrors, JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET, ALGORITHM } from '../configs/config';

export interface AuthRequest extends Request {
  user?: JwtPayload | string;
  customer_id?: number;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: 'Authorization header missing' });
    return;
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ message: 'Malformed authorization header. Expected Bearer <token>' });
    return;
  }

  jwt.verify(token, JWT_SECRET, { algorithms: [ALGORITHM as jwt.Algorithm] }, (err, payload) => {
    if (err) {
      console.error('JWT error:', err);
      if ((err as any).name === 'TokenExpiredError') {
        res.status(401).json({ message: 'Token has expired' });
      } else {
        res.status(403).json({ message: 'Invalid token: ' + err.message });
      }
      return;
    }
    req.user = payload!;
    if (typeof payload === 'object' && payload !== null && 'customer_id' in payload) {
      req.customer_id = Number(payload.customer_id);
    }
    next();
  });
};
