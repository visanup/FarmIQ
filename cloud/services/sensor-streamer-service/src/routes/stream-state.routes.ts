import { FastifyInstance } from 'fastify';
import { StreamStateService } from '../services/stream-state.service';

const streamStateService = new StreamStateService();

export async function streamStateRoutes(fastify: FastifyInstance) {
  // Get all stream states
  fastify.get(
    '/',
    {
      schema: {
        description: 'Get all stream states',
        tags: ['Stream States'],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'string', default: '1' },
            limit: { type: 'string', default: '10' },
            deviceId: { type: 'string' },
            streamType: { type: 'string' },
            isActive: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              states: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    deviceId: { type: 'string' },
                    streamType: { type: 'string' },
                    isActive: { type: 'boolean' },
                    lastProcessedAt: { type: 'string', format: 'date-time', nullable: true },
                    lastError: { type: 'string', nullable: true },
                    retryCount: { type: 'number' },
                    config: { type: 'object', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                  },
                },
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
        const { deviceId, streamType, isActive, page = 1, limit = 10 } = request.query as any;
        const result = await streamStateService.getStreamStates(
          parseInt(page),
          parseInt(limit),
          deviceId,
          streamType,
          isActive === 'true' ? true : isActive === 'false' ? false : undefined
        );
        return reply.send(result);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Get stream state by device ID
  fastify.get(
    '/device/:deviceId',
    {
      schema: {
        description: 'Get stream state by device ID',
        tags: ['Stream States'],
        params: {
          type: 'object',
          properties: {
            deviceId: { type: 'string' },
          },
          required: ['deviceId'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              deviceId: { type: 'string' },
              streamType: { type: 'string' },
              isActive: { type: 'boolean' },
              lastProcessedAt: { type: 'string', format: 'date-time', nullable: true },
              lastError: { type: 'string', nullable: true },
              retryCount: { type: 'number' },
              config: { type: 'object', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
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
        const { deviceId } = request.params as { deviceId: string };
        const state = await streamStateService.getStreamStateByDeviceId(deviceId);
        
        if (!state) {
          return reply.status(404).send({ error: 'Stream state not found' });
        }

        return reply.send(state);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Create or update stream state
  fastify.post(
    '/',
    {
      schema: {
        description: 'Create or update a stream state',
        tags: ['Stream States'],
        body: {
          type: 'object',
          properties: {
            deviceId: { type: 'string' },
            streamType: { type: 'string' },
            isActive: { type: 'boolean', default: true },
            lastProcessedAt: { type: 'string', format: 'date-time', nullable: true },
            lastError: { type: 'string', nullable: true },
            retryCount: { type: 'number', default: 0 },
            config: { type: 'object', nullable: true },
          },
          required: ['deviceId', 'streamType'],
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              deviceId: { type: 'string' },
              streamType: { type: 'string' },
              isActive: { type: 'boolean' },
              lastProcessedAt: { type: 'string', format: 'date-time', nullable: true },
              lastError: { type: 'string', nullable: true },
              retryCount: { type: 'number' },
              config: { type: 'object', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
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
        const state = await streamStateService.createOrUpdateStreamState(request.body as any);
        return reply.status(201).send(state);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Update stream state
  fastify.put(
    '/:id',
    {
      schema: {
        description: 'Update a stream state',
        tags: ['Stream States'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            isActive: { type: 'boolean' },
            lastProcessedAt: { type: 'string', format: 'date-time', nullable: true },
            lastError: { type: 'string', nullable: true },
            retryCount: { type: 'number' },
            config: { type: 'object', nullable: true },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              deviceId: { type: 'string' },
              streamType: { type: 'string' },
              isActive: { type: 'boolean' },
              lastProcessedAt: { type: 'string', format: 'date-time', nullable: true },
              lastError: { type: 'string', nullable: true },
              retryCount: { type: 'number' },
              config: { type: 'object', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
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
        const state = await streamStateService.updateStreamState(id, request.body as any);
        return reply.send(state);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          return reply.status(404).send({ error: error.message });
        }
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Delete stream state
  fastify.delete(
    '/:id',
    {
      schema: {
        description: 'Delete a stream state',
        tags: ['Stream States'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          204: {
            type: 'null',
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
        await streamStateService.deleteStreamState(id);
        return reply.status(204).send();
      } catch (error: any) {
        if (error.message.includes('not found')) {
          return reply.status(404).send({ error: error.message });
        }
        return reply.status(500).send({ error: error.message });
      }
    }
  );
}
