import { FastifyInstance } from 'fastify';
import { SweepReadingService } from '../services/sweep-reading.service';

const sweepReadingService = new SweepReadingService();

export async function sweepReadingRoutes(fastify: FastifyInstance) {
  // Get all sweep readings
  fastify.get(
    '/',
    {
      schema: {
        description: 'Get all sweep readings',
        tags: ['Sweep Readings'],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'string', default: '1' },
            limit: { type: 'string', default: '10' },
            search: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            deviceId: { type: 'string' },
            sweepId: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              readings: {
                type: 'array',
                items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                deviceId: { type: 'string' },
                farmId: { type: 'string', nullable: true },
                sweepId: { type: 'string' },
                data: { type: 'object' },
                metadata: { type: 'object', nullable: true },
                timestamp: { type: 'string', format: 'date-time' },
                createdAt: { type: 'string', format: 'date-time' },
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
        const { deviceId, sweepId, page = 1, limit = 10, startDate, endDate } = request.query as any;
        const result = await sweepReadingService.getSweepReadings(
          parseInt(page), 
          parseInt(limit), 
          deviceId, 
          sweepId, 
          startDate, 
          endDate
        );
        return reply.send(result);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Get sweep reading by ID
  fastify.get(
    '/:id',
    {
      schema: {
        description: 'Get sweep reading by ID',
        tags: ['Sweep Readings'],
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
                id: { type: 'string' },
                deviceId: { type: 'string' },
                farmId: { type: 'string', nullable: true },
                sweepId: { type: 'string' },
                data: { type: 'object' },
                metadata: { type: 'object', nullable: true },
                timestamp: { type: 'string', format: 'date-time' },
                createdAt: { type: 'string', format: 'date-time' },
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
        const reading = await sweepReadingService.getSweepReadingById(id);
        
        if (!reading) {
          return reply.status(404).send({ error: 'Sweep reading not found' });
        }

        return reply.send(reading);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Create sweep reading
  fastify.post(
    '/',
    {
      schema: {
        description: 'Create a new sweep reading',
        tags: ['Sweep Readings'],
        body: {
            type: 'object',
            properties: {
              deviceId: { type: 'string' },
              farmId: { type: 'string', nullable: true },
              sweepId: { type: 'string' },
              data: { type: 'object' },
              metadata: { type: 'object', nullable: true },
              timestamp: { type: 'string', format: 'date-time' },
            },
            required: ['deviceId', 'sweepId', 'data', 'timestamp'],
          },
        response: {
          201: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                deviceId: { type: 'string' },
                farmId: { type: 'string', nullable: true },
                sweepId: { type: 'string' },
                data: { type: 'object' },
                metadata: { type: 'object', nullable: true },
                timestamp: { type: 'string', format: 'date-time' },
                createdAt: { type: 'string', format: 'date-time' },
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
        const reading = await sweepReadingService.createSweepReading(request.body as any);
        return reply.status(201).send(reading);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Create many sweep readings (batch)
  fastify.post(
    '/batch',
    {
      schema: {
        description: 'Create multiple sweep readings',
        tags: ['Sweep Readings'],
        body: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              deviceId: { type: 'string' },
              farmId: { type: 'string', nullable: true },
              sweepId: { type: 'string' },
              data: { type: 'object' },
              metadata: { type: 'object', nullable: true },
              timestamp: { type: 'string', format: 'date-time' },
            },
            required: ['deviceId', 'sweepId', 'data', 'timestamp'],
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              inserted: { type: 'number' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await sweepReadingService.createMany(request.body as any[]);
        return reply.status(201).send(result);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Get sweep readings by device ID
  fastify.get(
    '/device/:deviceId',
    {
      schema: {
        description: 'Get sweep readings by device ID',
        tags: ['Sweep Readings'],
        params: {
          type: 'object',
          properties: {
            deviceId: { type: 'string' },
          },
          required: ['deviceId'],
        },
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'number', default: 10 },
          },
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                deviceId: { type: 'string' },
                farmId: { type: 'string', nullable: true },
                sweepId: { type: 'string' },
                data: { type: 'object' },
                metadata: { type: 'object', nullable: true },
                timestamp: { type: 'string', format: 'date-time' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { deviceId } = request.params as { deviceId: string };
        const { limit = 10 } = request.query as { limit?: number };
        const readings = await sweepReadingService.getSweepReadingsByDevice(deviceId, limit);
        return reply.send(readings);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Get sweep readings by sweep ID
  fastify.get(
    '/sweep/:sweepId',
    {
      schema: {
        description: 'Get sweep readings by sweep ID',
        tags: ['Sweep Readings'],
        params: {
          type: 'object',
          properties: {
            sweepId: { type: 'string' },
          },
          required: ['sweepId'],
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                deviceId: { type: 'string' },
                farmId: { type: 'string', nullable: true },
                sweepId: { type: 'string' },
                data: { type: 'object' },
                metadata: { type: 'object', nullable: true },
                timestamp: { type: 'string', format: 'date-time' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { sweepId } = request.params as { sweepId: string };
        const readings = await sweepReadingService.getSweepReadingsBySweep(sweepId);
        return reply.send(readings);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Get the latest timestamp for sweep readings
  fastify.get(
    '/latest-timestamp',
    {
      schema: {
        description: 'Get the latest timestamp for sweep readings',
        tags: ['Sweep Readings'],
        response: {
          200: {
            type: 'object',
            properties: {
              last_ts: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await sweepReadingService.getLatestTimestamp();
        return reply.send(result);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );
}

