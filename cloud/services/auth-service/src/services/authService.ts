//services/auth-service/src/services/authService.ts

import { Repository } from 'typeorm';
import { User } from '../models/user.model';
import { RefreshToken } from '../models/refreshToken.model';
import { hashPassword, comparePassword } from '../utils/hash';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS } from '../configs/config';
import fetch from 'node-fetch';
import { CUSTOMER_SERVICE_URL } from '../configs/config';

//const CUSTOMER_SERVICE_URL = process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3000/api/customers';

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
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // เรียก Customer-Service สร้างลูกค้าใหม่
    const response = await fetch(CUSTOMER_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      throw new Error('Failed to create customer');
    }
    const customer = await response.json();

    // Hash รหัสผ่าน
    const password_hash = await hashPassword(password);

    // สร้าง user ใน auth.users พร้อม customer_id ที่ได้จาก customer-service
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
      {
        sub: user.user_id,
        username: user.username,
        role: user.role,
        customer_id: user.customer_id,
      },
      JWT_SECRET,
      { expiresIn: `${ACCESS_TOKEN_EXPIRE_MINUTES}m` }
    );

    const refreshTokenValue = jwt.sign(
      { sub: user.user_id },
      JWT_SECRET,
      { expiresIn: `${REFRESH_TOKEN_EXPIRE_DAYS}d` }
    );

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

  async refresh(refreshTokenValue: string) {
    const storedToken = await this.tokenRepo.findOne({
      where: { refresh_token: refreshTokenValue, revoked: false },
      relations: ['user'],
    });

    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }
    if (storedToken.expires_at && storedToken.expires_at < new Date()) {
      throw new Error('Refresh token expired');
    }

    // Verify token signature
    try {
      jwt.verify(refreshTokenValue, JWT_SECRET);
    } catch {
      throw new Error('Invalid refresh token');
    }

    const user = storedToken.user;

    // Issue new access token พร้อม customer_id
    const accessToken = jwt.sign(
      {
        sub: user.user_id,
        username: user.username,
        role: user.role,
        customer_id: user.customer_id,
      },
      JWT_SECRET,
      { expiresIn: `${ACCESS_TOKEN_EXPIRE_MINUTES}m` }
    );

    return {
      access_token: accessToken,
      token_type: 'bearer',
    };
  }
}
