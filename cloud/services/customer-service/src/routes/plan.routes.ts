import { FastifyInstance } from 'fastify';
import { PlanService } from '../services/plan.service';
import {
  CreatePlanSchema,
  UpdatePlanSchema,
  PlanResponseSchema,
  PaginationQuerySchema,
} from '../schemas/customer.schemas';

const planService = new PlanService();

export async function planRoutes(fastify: FastifyInstance) {
  // Get all plans
  fastify.get(
    '/',
    {
      schema: {
        description: 'Get all plans',
        tags: ['Plans'],
        querystring: PaginationQuerySchema,
        response: {
          200: {
            type: 'object',
            properties: {
              plans: {
                type: 'array',
                items: PlanResponseSchema,
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
        const pagination = request.query as any;
        const result = await planService.getPlans(pagination);
        return reply.send(result);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Get plan by ID
  fastify.get(
    '/:id',
    {
      schema: {
        description: 'Get plan by ID',
        tags: ['Plans'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          200: PlanResponseSchema,
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
        const plan = await planService.getPlanById(id);
        
        if (!plan) {
          return reply.status(404).send({ error: 'Plan not found' });
        }

        return reply.send(plan);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Create plan
  fastify.post(
    '/',
    {
      schema: {
        description: 'Create a new plan',
        tags: ['Plans'],
        body: CreatePlanSchema,
        response: {
          201: PlanResponseSchema,
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
        const plan = await planService.createPlan(request.body as any);
        return reply.status(201).send(plan);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Update plan
  fastify.put(
    '/:id',
    {
      schema: {
        description: 'Update plan',
        tags: ['Plans'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        body: UpdatePlanSchema,
        response: {
          200: PlanResponseSchema,
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
        const plan = await planService.updatePlan(id, request.body as any);
        return reply.send(plan);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Delete plan
  fastify.delete(
    '/:id',
    {
      schema: {
        description: 'Delete plan',
        tags: ['Plans'],
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
        await planService.deletePlan(id);
        return reply.send({ message: 'Plan deleted successfully' });
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );
}

