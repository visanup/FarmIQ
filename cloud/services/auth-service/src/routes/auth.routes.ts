import { FastifyInstance } from 'fastify';
import { AuthService } from '../services/auth.service';
import {
  LoginSchema,
  RegisterSchema,
  RefreshTokenSchema,
  ChangePasswordSchema,
} from '../schemas/auth.schemas';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateZod } from '../utils/validateZod';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import { publish } from '../utils/kafka';
import { KAFKA_TOPIC_USER, KAFKA_TOPIC_TOKEN } from '../configs/config';

const authService = new AuthService();

// ---- JSON Schemas (AJV-friendly) ---- //
const RegisterBodySchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8 },
    name: { type: 'string', minLength: 1 },
  },
  required: ['email', 'password', 'name'],
  additionalProperties: false,
} as const;

const LoginBodySchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 1 },
  },
  required: ['email', 'password'],
  additionalProperties: false,
} as const;

const RefreshBodySchema = {
  type: 'object',
  properties: {
    refreshToken: { type: 'string', minLength: 1 },
  },
  required: ['refreshToken'],
  additionalProperties: false,
} as const;

const LogoutBodySchema = RefreshBodySchema; // same shape

const ChangePasswordBodySchema = {
  type: 'object',
  properties: {
    currentPassword: { type: 'string', minLength: 1 },
    newPassword: { type: 'string', minLength: 8 },
  },
  required: ['currentPassword', 'newPassword'],
  additionalProperties: false,
} as const;

const VerifyEmailBodySchema = {
  type: 'object',
  properties: { token: { type: 'string', minLength: 1 } },
  required: ['token'],
  additionalProperties: false,
} as const;

const ForgotPasswordBodySchema = {
  type: 'object',
  properties: { email: { type: 'string', format: 'email' } },
  required: ['email'],
  additionalProperties: false,
} as const;

const ResetPasswordBodySchema = {
  type: 'object',
  properties: {
    token: { type: 'string', minLength: 1 },
    newPassword: { type: 'string', minLength: 8 },
  },
  required: ['token', 'newPassword'],
  additionalProperties: false,
} as const;

export async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post(
    '/register',
    {
      schema: {
        description: 'Register a new user',
        tags: ['Authentication'],
        body: RegisterBodySchema,
      },
      // Zod validation (kept for better error messages)
      preValidation: [validateZod('body', RegisterSchema)],
    },
    async (request: any, reply: any) => {
      try {
        const result = await authService.register(request.body as any);
        const user = result.user;
        const vt = await authService.requestEmailVerification(user.id);
        await sendVerificationEmail(user.email, vt.token);
        await publish(KAFKA_TOPIC_USER, { type: 'user.created', user });
        return reply.status(201).send(result);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Login
  fastify.post(
    '/login',
    {
      config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
      schema: {
        description: 'Login user',
        tags: ['Authentication'],
        body: LoginBodySchema,
      },
      preValidation: [validateZod('body', LoginSchema)],
    },
    async (request: any, reply: any) => {
      try {
        const result = await authService.login(request.body as any);
        await publish(KAFKA_TOPIC_USER, {
          type: 'user.login',
          userId: result.user.id,
          email: result.user.email,
          ts: new Date().toISOString(),
        });
        return reply.send(result);
      } catch (error: any) {
        return reply.status(401).send({ error: error.message });
      }
    }
  );

  // Refresh token
  fastify.post(
    '/refresh',
    {
      config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
      schema: {
        description: 'Refresh access token',
        tags: ['Authentication'],
        body: RefreshBodySchema,
      },
      preValidation: [validateZod('body', RefreshTokenSchema)],
    },
    async (request: any, reply: any) => {
      try {
        const result = await authService.refreshToken(request.body as any);
        await publish(KAFKA_TOPIC_TOKEN, {
          type: 'token.refreshed',
          userId: (request as any).user?.userId,
          ts: new Date().toISOString(),
        });
        return reply.send(result);
      } catch (error: any) {
        return reply.status(401).send({ error: error.message });
      }
    }
  );

  // Logout
  fastify.post(
    '/logout',
    {
      preHandler: [authenticateToken],
      schema: {
        description: 'Logout user',
        tags: ['Authentication'],
        body: LogoutBodySchema,
      },
      preValidation: [validateZod('body', RefreshTokenSchema)],
    },
    async (request: any, reply: any) => {
      try {
        await authService.logout((request.body as any).refreshToken);
        return reply.send({ message: 'Logged out successfully' });
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Request verification email
  fastify.post(
    '/request-email-verification',
    {
      preHandler: [authenticateToken],
      config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
      schema: {
        description: 'Request email verification',
        tags: ['Authentication'],
      },
    },
    async (request, reply) => {
      const user = (request as any).user;
      const { token } = await authService.requestEmailVerification(user.userId);
      await sendVerificationEmail(user.email, token);
      return reply.send({ message: 'Verification email sent' });
    }
  );

  // Verify email
  fastify.post(
    '/verify-email',
    {
      config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
      schema: {
        description: 'Verify email by token',
        tags: ['Authentication'],
        body: VerifyEmailBodySchema,
      },
    },
    async (request, reply) => {
      try {
        const { token } = request.body as any;
        await authService.verifyEmail(token);
        return reply.send({ message: 'Email verified' });
      } catch (e: any) {
        return reply.status(400).send({ error: e.message });
      }
    }
  );

  // Forgot password
  fastify.post(
    '/forgot-password',
    {
      config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
      schema: {
        description: 'Request password reset',
        tags: ['Authentication'],
        body: ForgotPasswordBodySchema,
      },
    },
    async (request, reply) => {
      const { email } = request.body as any;
      const res = await authService.forgotPassword(email);
      if (res?.token) await sendPasswordResetEmail(email, res.token);
      return reply.send({ message: 'If the email exists, a reset link has been sent' });
    }
  );

  // Reset password
  fastify.post(
    '/reset-password',
    {
      config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
      schema: {
        description: 'Reset password with token',
        tags: ['Authentication'],
        body: ResetPasswordBodySchema,
      },
    },
    async (request, reply) => {
      try {
        const { token, newPassword } = request.body as any;
        await authService.resetPassword(token, newPassword);
        return reply.send({ message: 'Password reset successful' });
      } catch (e: any) {
        return reply.status(400).send({ error: e.message });
      }
    }
  );

  // Change password
  fastify.post(
    '/change-password',
    {
      preHandler: [authenticateToken],
      schema: {
        description: 'Change user password',
        tags: ['Authentication'],
        body: ChangePasswordBodySchema,
      },
      preValidation: [validateZod('body', ChangePasswordSchema)],
    },
    async (request: any, reply: any) => {
      try {
        const user = (request as any).user;
        await authService.changePassword(user.userId, request.body as any);
        return reply.send({ message: 'Password changed successfully' });
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Get current user
  fastify.get(
    '/me',
    {
      preHandler: [authenticateToken],
      schema: {
        description: 'Get current user information',
        tags: ['Authentication'],
        response: {
          200: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  name: { type: 'string' },
                  role: { type: 'string' },
                  isActive: { type: 'boolean' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                },
                required: ['id', 'email', 'name', 'role', 'isActive', 'createdAt', 'updatedAt'],
                additionalProperties: true,
              },
            },
            required: ['user'],
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const user = (request as any).user;
        const userData = await authService.getUserById(user.userId);

        if (!userData) {
          return reply.status(404).send({ error: 'User not found' });
        }

        return reply.send({ user: userData });
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );
}
