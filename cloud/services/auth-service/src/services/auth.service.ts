//services/auth-service/src/services/auth.service.ts

import { Repository } from 'typeorm';
import { User } from '../models/user.model';
import { RefreshToken } from '../models/refreshToken.model';
import { hashPassword, comparePassword } from '../utils/hash';
import jwt from 'jsonwebtoken';
import {
  JWT_SECRET,
  ACCESS_TOKEN_EXPIRE_MINUTES,
  REFRESH_TOKEN_EXPIRE_DAYS,
  CUSTOMER_SERVICE_URL,
} from '../configs/config';
import fetch from 'node-fetch';

export class AuthService {
  constructor(
    private userRepo: Repository<User>,
    private tokenRepo: Repository<RefreshToken>
  ) {}

  async signup(
    email: string,
    username: string,
    password: string,
    customerData: { name: string; email?: string; phone?: string }
  ) {
    const existingUser = await this.userRepo.findOneBy({ username });
    if (existingUser) throw new Error('Username already exists');

    // สร้าง customer ผ่าน customer-service
    const resp = await fetch(CUSTOMER_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData),
    });
    if (!resp.ok) throw new Error(`Failed to create customer (${resp.status})`);
    const customer = await resp.json();

    const password_hash = await hashPassword(password);
    const user = this.userRepo.create({
      email,
      username,
      password_hash,
      customer_id: customer.customer_id,
    });
    await this.userRepo.save(user);

    return { message: 'User created' };
  }

  async login(username: string, password: string) {
    const user = await this.userRepo.findOneBy({ username });
    if (!user) throw new Error('Invalid username or password');

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) throw new Error('Invalid username or password');

    const accessToken = jwt.sign(
      { sub: user.user_id, username: user.username, role: user.role, customer_id: user.customer_id },
      JWT_SECRET,
      { expiresIn: `${ACCESS_TOKEN_EXPIRE_MINUTES}m` }
    );

    const refreshTokenValue = jwt.sign({ sub: user.user_id }, JWT_SECRET, {
      expiresIn: `${REFRESH_TOKEN_EXPIRE_DAYS}d`,
    });

    const refreshToken = this.tokenRepo.create({
      user,
      refresh_token: refreshTokenValue,
      expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRE_DAYS * 86400000),
    });
    await this.tokenRepo.save(refreshToken);

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      tokenType: 'bearer',
      userId: user.user_id,
    };
  }

  async refresh(oldRefreshToken: string) {
    const stored = await this.tokenRepo.findOne({
      where: { refresh_token: oldRefreshToken, revoked: false },
      relations: ['user'],
    });
    if (!stored) throw new Error('Invalid refresh token');

    if (stored.expires_at && stored.expires_at < new Date()) {
      throw new Error('Refresh token expired');
    }

    try {
      jwt.verify(oldRefreshToken, JWT_SECRET);
    } catch {
      throw new Error('Invalid refresh token');
    }

    const user = stored.user;

    // ออก access token ใหม่
    const accessToken = jwt.sign(
      { sub: user.user_id, username: user.username, role: user.role, customer_id: user.customer_id },
      JWT_SECRET,
      { expiresIn: `${ACCESS_TOKEN_EXPIRE_MINUTES}m` }
    );

    // หมุน refresh token (revoke เดิม + สร้างใหม่)
    stored.revoked = true;
    await this.tokenRepo.save(stored);

    const newRefreshToken = jwt.sign({ sub: user.user_id }, JWT_SECRET, {
      expiresIn: `${REFRESH_TOKEN_EXPIRE_DAYS}d`,
    });

    const newTokenRow = this.tokenRepo.create({
      user,
      refresh_token: newRefreshToken,
      expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRE_DAYS * 86400000),
    });
    await this.tokenRepo.save(newTokenRow);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      tokenType: 'bearer',
    };
  }
}
