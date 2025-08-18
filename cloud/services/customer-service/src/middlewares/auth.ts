// src/middlewares/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { JWKS_URL, JWT_ALG, JWT_SECRET } from '../configs/config';

export type Claims = JwtPayload & {
  role?: string;
  tenant_id?: string;
  sub?: string; // optional ใน type แต่เราจะเช็คจริงก่อนใช้งาน
};

export interface AuthRequest extends Request {
  user?: Claims;
}

async function verify(token: string): Promise<Claims> {
  if (JWKS_URL && JWT_ALG.startsWith('RS')) {
    const client = jwksClient({ jwksUri: JWKS_URL, cache: true, cacheMaxEntries: 5 });
    const decoded: any = jwt.decode(token, { complete: true });
    const kid = decoded?.header?.kid;
    const key = await client.getSigningKey(kid);
    const pub = key.getPublicKey();
    return jwt.verify(token, pub, { algorithms: [JWT_ALG] }) as Claims;
  }
  return jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALG] }) as Claims;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) return res.status(401).json({ message: 'Missing bearer token' });

    const claims = await verify(token);
    if (!claims.sub) return res.status(400).json({ message: 'Token missing sub' });
    req.user = claims;
    return next();
  } catch (e: any) {
    const code = e?.name === 'TokenExpiredError' ? 401 : 403;
    return res.status(code).json({ message: e?.message || 'Invalid token' });
  }
};

export const requireRoles = (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };

export const requireTenant = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.tenant_id) return res.status(400).json({ message: 'Missing tenant_id in token' });
  next();
};

