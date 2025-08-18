// src/routes/auth.route.ts

import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';
import { RefreshToken } from '../models/refreshToken.model';
import { DataSource } from 'typeorm';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../configs/config';

// ⬇️ ใส่เพิ่ม
import { validate } from '../middleware/validate';
import {
  SignupBodySchema,
  LoginBodySchema,
  RefreshBodySchema,
  SignupBody,
  LoginBody,
  RefreshBody,
} from '../schemas/auth.schemas';

export function createAuthRouter(dataSource: DataSource) {
  const router = Router();
  const userRepo = dataSource.getRepository(User);
  const tokenRepo = dataSource.getRepository(RefreshToken);
  const authService = new AuthService(userRepo, tokenRepo);

  router.post('/signup', validate(SignupBodySchema), async (req: Request, res: Response) => {
    const { email, username, password, customer } = req.body as SignupBody;
    try {
      const result = await authService.signup(email, username, password, customer);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  router.post('/login', validate(LoginBodySchema), async (req: Request, res: Response) => {
    const { username, password } = req.body as LoginBody;
    try {
      const result = await authService.login(username, password);
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ message: err.message });
    }
  });

  router.post('/refresh', validate(RefreshBodySchema), async (req: Request, res: Response) => {
    const { refreshToken } = req.body as RefreshBody;
    try {
      const result = await authService.refresh(refreshToken);
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ message: err.message });
    }
  });

  // /me คงเดิม (ใช้ JWT ตรวจแล้ว)
  router.get('/me', async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid Authorization header' });
    }
    const token = authHeader.substring(7);
    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    const userId = payload.sub;
    if (!userId) return res.status(401).json({ message: 'Invalid token payload' });

    try {
      const user = await userRepo.findOne({
        where: { user_id: userId },
        select: ['user_id', 'username', 'email', 'role', 'created_at'],
      });
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({
        userId: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
      });
    } catch {
      res.status(500).json({ message: 'Could not load user profile' });
    }
  });

  return router;
}
