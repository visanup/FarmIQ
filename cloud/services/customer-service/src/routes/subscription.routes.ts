import { FastifyInstance } from 'fastify';
import { SubscriptionService } from '../services/subscription.service';
import {
  CreateSubscriptionSchema,
  UpdateSubscriptionSchema,
  SubscriptionResponseSchema,
  PaginationQuerySchema,
} from '../schemas/customer.schemas';

const subscriptionService = new SubscriptionService();

export async function subscriptionRoutes(fastify: FastifyInstance) {
  // Get all subscriptions
  fastify.get(
    '/',
    {
      schema: {
        description: 'Get all subscriptions',
        tags: ['Subscriptions'],
        querystring: {
          allOf: [
            PaginationQuerySchema,
            {
              type: 'object',
              properties: {
                customerId: { type: 'string' },
              },
            },
          ],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              subscriptions: {
                type: 'array',
                items: SubscriptionResponseSchema,
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
        const { customerId, ...pagination } = request.query as any;
        const result = await subscriptionService.getSubscriptions(pagination, customerId);
        return reply.send(result);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Get subscription by ID
  fastify.get(
    '/:id',
    {
      schema: {
        description: 'Get subscription by ID',
        tags: ['Subscriptions'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          200: SubscriptionResponseSchema,
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
        const subscription = await subscriptionService.getSubscriptionById(id);
        
        if (!subscription) {
          return reply.status(404).send({ error: 'Subscription not found' });
        }

        return reply.send(subscription);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Create subscription
  fastify.post(
    '/',
    {
      schema: {
        description: 'Create a new subscription',
        tags: ['Subscriptions'],
        body: CreateSubscriptionSchema,
        response: {
          201: SubscriptionResponseSchema,
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
        // For now, use a default createdById - in real app, get from auth
        const createdById = 'default-user-id';
        const subscription = await subscriptionService.createSubscription(
          request.body as any,
          createdById
        );
        return reply.status(201).send(subscription);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Update subscription
  fastify.put(
    '/:id',
    {
      schema: {
        description: 'Update subscription',
        tags: ['Subscriptions'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        body: UpdateSubscriptionSchema,
        response: {
          200: SubscriptionResponseSchema,
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
        const subscription = await subscriptionService.updateSubscription(id, request.body as any);
        return reply.send(subscription);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Cancel subscription
  fastify.post(
    '/:id/cancel',
    {
      schema: {
        description: 'Cancel subscription',
        tags: ['Subscriptions'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          200: SubscriptionResponseSchema,
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
        const subscription = await subscriptionService.cancelSubscription(id);
        return reply.send(subscription);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );
}

