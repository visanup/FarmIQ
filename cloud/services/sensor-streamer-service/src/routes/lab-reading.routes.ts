import { FastifyInstance } from 'fastify';
import { LabReadingService } from '../services/lab-reading.service';

const labReadingService = new LabReadingService();

export async function labReadingRoutes(fastify: FastifyInstance) {
  // Get all lab readings
  fastify.get(
    '/',
    {
      schema: {
        description: 'Get all lab readings',
        tags: ['Lab Readings'],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'string', default: '1' },
            limit: { type: 'string', default: '10' },
            search: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            sampleId: { type: 'string' },
            testType: { type: 'string' },
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
                sampleId: { type: 'string' },
                farmId: { type: 'string', nullable: true },
                testType: { type: 'string' },
                value: { type: 'number' },
                unit: { type: 'string' },
                result: { type: 'string', nullable: true },
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
        const { sampleId, testType, page = 1, limit = 10, startDate, endDate } = request.query as any;
        const result = await labReadingService.getLabReadings(
          parseInt(page), 
          parseInt(limit), 
          sampleId, 
          testType, 
          startDate, 
          endDate
        );
        return reply.send(result);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Get lab reading by ID
  fastify.get(
    '/:id',
    {
      schema: {
        description: 'Get lab reading by ID',
        tags: ['Lab Readings'],
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
                sampleId: { type: 'string' },
                farmId: { type: 'string', nullable: true },
                testType: { type: 'string' },
                value: { type: 'number' },
                unit: { type: 'string' },
                result: { type: 'string', nullable: true },
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
        const reading = await labReadingService.getLabReadingById(id);
        
        if (!reading) {
          return reply.status(404).send({ error: 'Lab reading not found' });
        }

        return reply.send(reading);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Create lab reading
  fastify.post(
    '/',
    {
      schema: {
        description: 'Create a new lab reading',
        tags: ['Lab Readings'],
        body: {
            type: 'object',
            properties: {
              sampleId: { type: 'string' },
              farmId: { type: 'string', nullable: true },
              testType: { type: 'string' },
              value: { type: 'number' },
              unit: { type: 'string' },
              result: { type: 'string', nullable: true },
              metadata: { type: 'object', nullable: true },
              timestamp: { type: 'string', format: 'date-time' },
            },
            required: ['sampleId', 'testType', 'value', 'unit', 'timestamp'],
          },
        response: {
          201: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                sampleId: { type: 'string' },
                farmId: { type: 'string', nullable: true },
                testType: { type: 'string' },
                value: { type: 'number' },
                unit: { type: 'string' },
                result: { type: 'string', nullable: true },
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
        const reading = await labReadingService.createLabReading(request.body as any);
        return reply.status(201).send(reading);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Create many lab readings (batch)
  fastify.post(
    '/batch',
    {
      schema: {
        description: 'Create multiple lab readings',
        tags: ['Lab Readings'],
        body: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              sampleId: { type: 'string' },
              farmId: { type: 'string', nullable: true },
              testType: { type: 'string' },
              value: { type: 'number' },
              unit: { type: 'string' },
              result: { type: 'string', nullable: true },
              metadata: { type: 'object', nullable: true },
              timestamp: { type: 'string', format: 'date-time' },
            },
            required: ['sampleId', 'testType', 'value', 'unit', 'timestamp'],
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
        const result = await labReadingService.createMany(request.body as any[]);
        return reply.status(201).send(result);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Get lab readings by sample ID
  fastify.get(
    '/sample/:sampleId',
    {
      schema: {
        description: 'Get lab readings by sample ID',
        tags: ['Lab Readings'],
        params: {
          type: 'object',
          properties: {
            sampleId: { type: 'string' },
          },
          required: ['sampleId'],
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                sampleId: { type: 'string' },
                farmId: { type: 'string', nullable: true },
                testType: { type: 'string' },
                value: { type: 'number' },
                unit: { type: 'string' },
                result: { type: 'string', nullable: true },
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
        const { sampleId } = request.params as { sampleId: string };
        const readings = await labReadingService.getLabReadingsBySample(sampleId);
        return reply.send(readings);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Get lab readings by test type
  fastify.get(
    '/type/:testType',
    {
      schema: {
        description: 'Get lab readings by test type',
        tags: ['Lab Readings'],
        params: {
          type: 'object',
          properties: {
            testType: { type: 'string' },
          },
          required: ['testType'],
        },
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'string', default: '1' },
            limit: { type: 'string', default: '10' },
            search: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
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
                sampleId: { type: 'string' },
                farmId: { type: 'string', nullable: true },
                testType: { type: 'string' },
                value: { type: 'number' },
                unit: { type: 'string' },
                result: { type: 'string', nullable: true },
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
        const { testType } = request.params as { testType: string };
        const pagination = request.query as any;
        const result = await labReadingService.getLabReadingsByTestType(testType, pagination);
        return reply.send(result);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Get pending lab readings
  fastify.get(
    '/pending',
    {
      schema: {
        description: 'Get pending lab readings',
        tags: ['Lab Readings'],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                sampleId: { type: 'string' },
                farmId: { type: 'string', nullable: true },
                testType: { type: 'string' },
                value: { type: 'number' },
                unit: { type: 'string' },
                result: { type: 'string', nullable: true },
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
        const readings = await labReadingService.getPendingLabReadings();
        return reply.send(readings);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Get the latest timestamp for lab readings
  fastify.get(
    '/latest-timestamp',
    {
      schema: {
        description: 'Get the latest timestamp for lab readings',
        tags: ['Lab Readings'],
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
        const result = await labReadingService.getLatestTimestamp();
        return reply.send(result);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );
}

