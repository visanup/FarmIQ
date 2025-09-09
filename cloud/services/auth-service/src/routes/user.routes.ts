import { FastifyInstance } from 'fastify';
import { AuthService } from '../services/auth.service';
import {
  CreateUserSchema,
  UpdateUserSchema,
  UserResponseSchema,
} from '../schemas/auth.schemas';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const authService = new AuthService();

export async function userRoutes(fastify: FastifyInstance) {
  // Get all users
  fastify.get(
    '/',
    {
      preHandler: [authenticateToken, requireAdmin],
      schema: {
        description: 'Get all users',
        tags: ['Users'],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', default: 1 },
            limit: { type: 'number', default: 10 },
            search: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              users: {
                type: 'array',
                items: UserResponseSchema,
              },
              total: { type: 'number' },
              page: { type: 'number' },
              limit: { type: 'number' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { page = 1, limit = 10, search } = request.query as any;
        
        // For now, return all users (you can implement pagination and search later)
        const users = await fastify.prisma.user.findMany({
          where: search
            ? {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {},
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        });

        const total = await fastify.prisma.user.count({
          where: search
            ? {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {},
        });

        return reply.send({
          users: users.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          })),
          total,
          page,
          limit,
        });
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Get user by ID
  fastify.get(
    '/:id',
    {
      preHandler: [authenticateToken],
      schema: {
        description: 'Get user by ID',
        tags: ['Users'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          200: UserResponseSchema,
          404: {
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
        const { id } = request.params as { id: string };
        const user = await authService.getUserById(id);
        
        if (!user) {
          return reply.status(404).send({ error: 'User not found' });
        }

        return reply.send(user);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Create user
  fastify.post(
    '/',
    {
      preHandler: [authenticateToken, requireAdmin],
      schema: {
        description: 'Create a new user',
        tags: ['Users'],
        body: CreateUserSchema,
        response: {
          201: UserResponseSchema,
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
        const user = await authService.createUser(request.body as any);
        return reply.status(201).send(user);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Update user
  fastify.put(
    '/:id',
    {
      preHandler: [authenticateToken],
      schema: {
        description: 'Update user',
        tags: ['Users'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        body: UpdateUserSchema,
        response: {
          200: UserResponseSchema,
          404: {
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
        const { id } = request.params as { id: string };
        const currentUser = (request as any).user;
        
        // Users can only update their own profile unless they're admin
        if (currentUser.role !== 'ADMIN' && currentUser.userId !== id) {
          return reply.status(403).send({ error: 'Insufficient permissions' });
        }

        const user = await authService.updateUser(id, request.body as any);
        return reply.send(user);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Delete user
  fastify.delete(
    '/:id',
    {
      preHandler: [authenticateToken, requireAdmin],
      schema: {
        description: 'Delete user',
        tags: ['Users'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
          404: {
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
        const { id } = request.params as { id: string };
        
        // Check if user exists
        const user = await authService.getUserById(id);
        if (!user) {
          return reply.status(404).send({ error: 'User not found' });
        }

        // Soft delete by setting isActive to false
        await fastify.prisma.user.update({
          where: { id },
          data: { isActive: false },
        });

        return reply.send({ message: 'User deleted successfully' });
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );
}

