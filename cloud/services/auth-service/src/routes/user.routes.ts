import { FastifyInstance } from 'fastify';
import { AuthService } from '../services/auth.service';
import {
  CreateUserSchema,
  UpdateUserSchema,
} from '../schemas/auth.schemas';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import { validateZod } from '../utils/validateZod';

const authService = new AuthService();

// ---------------- JSON Schemas (AJV-friendly) ---------------- //
const UserEntitySchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string' },
    name: { type: 'string' },
    role: { type: 'string' }, // avoid enum to tolerate UPPER/lower variants
    isActive: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'email', 'name', 'role', 'isActive', 'createdAt', 'updatedAt'],
  additionalProperties: true,
} as const;

const UserListResponseSchema = {
  type: 'object',
  properties: {
    users: { type: 'array', items: UserEntitySchema },
    total: { type: 'integer', minimum: 0 },
    page: { type: 'integer', minimum: 1 },
    limit: { type: 'integer', minimum: 1 },
  },
  required: ['users', 'total', 'page', 'limit'],
  additionalProperties: false,
} as const;

const CreateUserBodySchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8 },
    name: { type: 'string', minLength: 1 },
    role: { type: 'string' },
    isActive: { type: 'boolean' },
  },
  required: ['email', 'password', 'name'],
  additionalProperties: false,
} as const;

const UpdateUserBodySchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    name: { type: 'string', minLength: 1 },
    role: { type: 'string' },
    isActive: { type: 'boolean' },
    password: { type: 'string', minLength: 8 }, // if your Update allows password
  },
  additionalProperties: false,
} as const;

const IdParamSchema = {
  type: 'object',
  properties: { id: { type: 'string' } },
  required: ['id'],
  additionalProperties: false,
} as const;

const CommonErrorSchema = {
  type: 'object',
  properties: { error: { type: 'string' } },
  required: ['error'],
  additionalProperties: false,
} as const;

const QueryListSchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', default: 1, minimum: 1 },
    limit: { type: 'integer', default: 10, minimum: 1, maximum: 100 },
    search: { type: 'string' },
  },
  additionalProperties: false,
} as const;

export async function userRoutes(fastify: FastifyInstance) {
  // GET / — list users
  fastify.get(
    '/',
    {
      preHandler: [authenticateToken, requireAdmin],
      schema: {
        description: 'Get all users',
        tags: ['Users'],
        querystring: QueryListSchema,
        response: { 200: UserListResponseSchema },
      },
    },
    async (request, reply) => {
      try {
        const { page = 1, limit = 10, search } = request.query as any;

        const where = search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {};

        const [users, total] = await Promise.all([
          (fastify as any).prisma.user.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
          }),
          (fastify as any).prisma.user.count({ where }),
        ]);

        return reply.send({
          users: users.map((u: any) => ({
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role,
            isActive: u.isActive,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
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

  // GET /:id — get one user
  fastify.get(
    '/:id',
    {
      preHandler: [authenticateToken],
      schema: {
        description: 'Get user by ID',
        tags: ['Users'],
        params: IdParamSchema,
        response: {
          200: UserEntitySchema,
          404: CommonErrorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const user = await authService.getUserById(id);
        if (!user) return reply.status(404).send({ error: 'User not found' });
        return reply.send({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // POST / — create user
  fastify.post(
    '/',
    {
      preHandler: [authenticateToken, requireAdmin],
      preValidation: [validateZod('body', CreateUserSchema)],
      schema: {
        description: 'Create a new user',
        tags: ['Users'],
        body: CreateUserBodySchema,
        response: {
          201: UserEntitySchema,
          400: CommonErrorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const user = await authService.createUser(request.body as any);
        return reply.status(201).send({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // PUT /:id — update user
  fastify.put(
    '/:id',
    {
      preHandler: [authenticateToken],
      preValidation: [validateZod('body', UpdateUserSchema)],
      schema: {
        description: 'Update user',
        tags: ['Users'],
        params: IdParamSchema,
        body: UpdateUserBodySchema,
        response: {
          200: UserEntitySchema,
          403: CommonErrorSchema,
          404: CommonErrorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const currentUser = (request as any).user;

        if (currentUser.role !== 'ADMIN' && currentUser.userId !== id) {
          return reply.status(403).send({ error: 'Insufficient permissions' });
        }

        const updated = await authService.updateUser(id, request.body as any);
        if (!updated) return reply.status(404).send({ error: 'User not found' });

        return reply.send({
          id: updated.id,
          email: updated.email,
          name: updated.name,
          role: updated.role,
          isActive: updated.isActive,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        });
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // DELETE /:id — soft delete
  fastify.delete(
    '/:id',
    {
      preHandler: [authenticateToken, requireAdmin],
      schema: {
        description: 'Delete user',
        tags: ['Users'],
        params: IdParamSchema,
        response: {
          200: { type: 'object', properties: { message: { type: 'string' } }, required: ['message'] },
          404: CommonErrorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };

        const exists = await authService.getUserById(id);
        if (!exists) return reply.status(404).send({ error: 'User not found' });

        await (fastify as any).prisma.user.update({ where: { id }, data: { isActive: false } });
        return reply.send({ message: 'User deleted successfully' });
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );
}
