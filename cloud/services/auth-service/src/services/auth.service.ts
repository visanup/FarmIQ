import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import {
  CreateUserInput,
  LoginInput,
  RegisterInput,
  RefreshTokenInput,
  ChangePasswordInput,
  AuthResponse,
  TokenResponse,
  UserResponse,
} from '../schemas/auth.schemas';
import {
  JWT_SECRET,
  JWT_ALGORITHM,
  ACCESS_TOKEN_EXPIRE_MINUTES,
  REFRESH_TOKEN_EXPIRE_DAYS,
} from '../configs/config';

export class AuthService {
  private readonly saltRounds = 12;

  async register(data: RegisterInput): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: 'USER',
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return {
      user: this.formatUserResponse(user),
      ...tokens,
    };
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return {
      user: this.formatUserResponse(user),
      ...tokens,
    };
  }

  async refreshToken(data: RefreshTokenInput): Promise<TokenResponse> {
    // Find refresh token
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token: data.refreshToken },
      include: { user: true },
    });

    if (!refreshToken || refreshToken.isRevoked || refreshToken.expiresAt < new Date()) {
      throw new Error('Invalid refresh token');
    }

    if (!refreshToken.user.isActive) {
      throw new Error('User account is inactive');
    }

    // Revoke old refresh token
    await prisma.refreshToken.update({
      where: { id: refreshToken.id },
      data: { isRevoked: true },
    });

    // Generate new tokens
    const tokens = await this.generateTokens(refreshToken.user.id);

    return tokens;
  }

  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true },
    });
  }

  async changePassword(userId: string, data: ChangePasswordInput): Promise<void> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(data.currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(data.newPassword, this.saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Revoke all refresh tokens
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  async createUser(data: CreateUserInput): Promise<UserResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role || 'USER',
      },
    });

    return this.formatUserResponse(user);
  }

  async updateUser(userId: string, data: any): Promise<UserResponse> {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return this.formatUserResponse(user);
  }

  async getUserById(userId: string): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return user ? this.formatUserResponse(user) : null;
  }

  async getUserByEmail(email: string): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user ? this.formatUserResponse(user) : null;
  }

  async verifyToken(token: string): Promise<{ userId: string; email: string }> {
    try {
      const payload = jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM] }) as any;
      return { userId: payload.userId, email: payload.email };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  private async generateTokens(userId: string): Promise<TokenResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate access token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      {
        algorithm: JWT_ALGORITHM,
        expiresIn: `${ACCESS_TOKEN_EXPIRE_MINUTES}m`,
      }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      JWT_SECRET,
      {
        algorithm: JWT_ALGORITHM,
        expiresIn: `${REFRESH_TOKEN_EXPIRE_DAYS}d`,
      }
    );

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRE_DAYS);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_EXPIRE_MINUTES * 60, // Convert to seconds
    };
  }

  private formatUserResponse(user: any): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}