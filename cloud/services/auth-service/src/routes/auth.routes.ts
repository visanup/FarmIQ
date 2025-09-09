import { FastifyInstance } from 'fastify';
import { AuthService } from '../services/auth.service';
import {
  LoginSchema,
  RegisterSchema,
  RefreshTokenSchema,
  ChangePasswordSchema,
  AuthResponseSchema,
  TokenResponseSchema,
} from '../schemas/auth.schemas';
import { authenticateToken } from '../middleware/auth.middleware';

const authService = new AuthService();

export async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post(
    '/register',
    {
      schema: {
        description: 'Register a new user',
        tags: ['Authentication'],
        body: RegisterSchema,
        response: {
          201: AuthResponseSchema,
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await authService.register(request.body as any);
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
      schema: {
        description: 'Login user',
        tags: ['Authentication'],
        body: LoginSchema,
        response: {
          200: AuthResponseSchema,
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await authService.login(request.body as any);
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
      schema: {
        description: 'Refresh access token',
        tags: ['Authentication'],
        body: RefreshTokenSchema,
        response: {
          200: TokenResponseSchema,
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await authService.refreshToken(request.body as any);
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
        body: RefreshTokenSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        await authService.logout((request.body as any).refreshToken);
        return reply.send({ message: 'Logged out successfully' });
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
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
        body: ChangePasswordSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
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
              },
            },
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

