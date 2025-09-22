import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
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
import { JWT_SECRET, JWT_ALGORITHM, JWT_ISSUER, JWT_AUDIENCE, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS } from '../configs/config';

export class AuthService {
  private readonly saltRounds = 12;

  private roleScopes(role: string): string[] {
    switch (role) {
      case 'ADMIN':
        return ['users:read', 'users:write', 'customers:read', 'customers:write'];
      case 'USER':
        return ['customers:read', 'customers:write'];
      case 'VIEWER':
      default:
        return ['customers:read'];
    }
  }

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

    // Create email verification token (valid 24h)
    const vExp = new Date();
    vExp.setHours(vExp.getHours() + 24);
    let vtoken = jwt.sign({ 
      userId: user.id, 
      type: 'verify',
      jti: crypto.randomUUID() // Add unique identifier
    }, JWT_SECRET, {
      algorithm: JWT_ALGORITHM,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      expiresIn: '24h',
    });
    
    // Check if token already exists and retry if needed
    let attempts = 0;
    let created = false;
    while (!created && attempts < 3) {
      try {
        await prisma.verificationToken.create({
          data: { token: vtoken, userId: user.id, expiresAt: vExp },
        });
        created = true;
      } catch (error: any) {
        if (error.code === 'P2002' && error.meta?.target?.includes('token')) {
          // Token already exists, generate a new one
          vtoken = jwt.sign({ 
            userId: user.id, 
            type: 'verify',
            jti: crypto.randomUUID()
          }, JWT_SECRET, {
            algorithm: JWT_ALGORITHM,
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
            expiresIn: '24h',
          });
          attempts++;
        } else {
          throw error;
        }
      }
    }
    
    if (!created) {
      throw new Error('Failed to create verification token after multiple attempts');
    }

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

    if (!refreshToken) {
      throw new Error('Invalid refresh token');
    }

    if (refreshToken.isRevoked || refreshToken.expiresAt < new Date()) {
      // Possible reuse attempt; revoke all active tokens for this user
      if (refreshToken.user) {
        await prisma.refreshToken.updateMany({
          where: { userId: refreshToken.user.id, isRevoked: false },
          data: { isRevoked: true },
        });
      }
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

  async requestEmailVerification(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    const vExp = new Date();
    vExp.setHours(vExp.getHours() + 24);
    let vtoken = jwt.sign({ 
      userId: user.id, 
      type: 'verify',
      jti: crypto.randomUUID() // Add unique identifier
    }, JWT_SECRET, {
      algorithm: JWT_ALGORITHM,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      expiresIn: '24h',
    });
    
    // Check if token already exists and retry if needed
    let attempts = 0;
    let created = false;
    while (!created && attempts < 3) {
      try {
        await prisma.verificationToken.create({ 
          data: { token: vtoken, userId: user.id, expiresAt: vExp } 
        });
        created = true;
      } catch (error: any) {
        if (error.code === 'P2002' && error.meta?.target?.includes('token')) {
          // Token already exists, generate a new one
          vtoken = jwt.sign({ 
            userId: user.id, 
            type: 'verify',
            jti: crypto.randomUUID()
          }, JWT_SECRET, {
            algorithm: JWT_ALGORITHM,
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
            expiresIn: '24h',
          });
          attempts++;
        } else {
          throw error;
        }
      }
    }
    
    if (!created) {
      throw new Error('Failed to create verification token after multiple attempts');
    }
    
    return { token: vtoken };
  }

  async verifyEmail(token: string) {
    const rec = await prisma.verificationToken.findUnique({ where: { token } });
    if (!rec || rec.usedAt || rec.expiresAt < new Date()) throw new Error('Invalid or expired token');
    // Verify signature
    jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM], issuer: JWT_ISSUER, audience: JWT_AUDIENCE });
    await prisma.verificationToken.update({ where: { id: rec.id }, data: { usedAt: new Date() } });
    // Mark user as active if needed (here we could set a flag if existed)
    return { ok: true };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return; // to avoid user enumeration
    const exp = new Date();
    exp.setHours(exp.getHours() + 2);
    let token = jwt.sign({ 
      userId: user.id, 
      type: 'reset',
      jti: crypto.randomUUID() // Add unique identifier
    }, JWT_SECRET, {
      algorithm: JWT_ALGORITHM,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      expiresIn: '2h',
    });
    
    // Check if token already exists and retry if needed
    let attempts = 0;
    let created = false;
    while (!created && attempts < 3) {
      try {
        await prisma.passwordResetToken.create({ 
          data: { token, userId: user.id, expiresAt: exp } 
        });
        created = true;
      } catch (error: any) {
        if (error.code === 'P2002' && error.meta?.target?.includes('token')) {
          // Token already exists, generate a new one
          token = jwt.sign({ 
            userId: user.id, 
            type: 'reset',
            jti: crypto.randomUUID()
          }, JWT_SECRET, {
            algorithm: JWT_ALGORITHM,
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
            expiresIn: '2h',
          });
          attempts++;
        } else {
          throw error;
        }
      }
    }
    
    if (!created) {
      throw new Error('Failed to create password reset token after multiple attempts');
    }
    
    return { token };
  }

  async resetPassword(token: string, newPassword: string) {
    const rec = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!rec || rec.usedAt || rec.expiresAt < new Date()) throw new Error('Invalid or expired token');
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as any;
    const hash = await bcrypt.hash(newPassword, this.saltRounds);
    await prisma.user.update({ where: { id: payload.userId }, data: { password: hash } });
    await prisma.passwordResetToken.update({ where: { id: rec.id }, data: { usedAt: new Date() } });
    // Revoke all refresh tokens
    await prisma.refreshToken.updateMany({ where: { userId: payload.userId, isRevoked: false }, data: { isRevoked: true } });
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
        name: data.name || null,
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

  async verifyToken(token: string): Promise<{ userId: string; email: string; role?: string }> {
    try {
      const payload = jwt.verify(token, JWT_SECRET, {
        algorithms: [JWT_ALGORITHM],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      }) as any;
      return { userId: payload.userId, email: payload.email, role: payload.role };
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
      { userId: user.id, email: user.email, role: user.role, scopes: this.roleScopes(user.role) },
      JWT_SECRET,
      {
        algorithm: JWT_ALGORITHM,
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        jwtid: crypto.randomUUID(),
        expiresIn: `${ACCESS_TOKEN_EXPIRE_MINUTES}m`,
      }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      JWT_SECRET,
      {
        algorithm: JWT_ALGORITHM,
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        jwtid: crypto.randomUUID(),
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
