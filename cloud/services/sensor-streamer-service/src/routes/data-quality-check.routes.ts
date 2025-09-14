import { FastifyInstance } from 'fastify';
import { DataQualityCheckService } from '../services/data-quality-check.service';

const dataQualityCheckService = new DataQualityCheckService();

export async function dataQualityCheckRoutes(fastify: FastifyInstance) {
  // Get all data quality checks
  fastify.get(
    '/',
    {
      schema: {
        description: 'Get all data quality checks',
        tags: ['Data Quality Checks'],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'string', default: '1' },
            limit: { type: 'string', default: '10' },
            deviceId: { type: 'string' },
            checkType: { type: 'string' },
            status: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              checks: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    deviceId: { type: 'string' },
                    checkType: { type: 'string' },
                    status: { type: 'string' },
                    message: { type: 'string' },
                    value: { type: 'number' },
                    expectedMin: { type: 'number' },
                    expectedMax: { type: 'number' },
                    metadata: { type: 'object', nullable: true },
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
        const { deviceId, checkType, status, page = 1, limit = 10 } = request.query as any;
        const result = await dataQualityCheckService.getDataQualityChecks(
          parseInt(page),
          parseInt(limit),
          deviceId,
          checkType,
          status
        );
        return reply.send(result);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Get data quality check by ID
  fastify.get(
    '/:id',
    {
      schema: {
        description: 'Get data quality check by ID',
        tags: ['Data Quality Checks'],
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
              checkType: { type: 'string' },
              status: { type: 'string' },
              message: { type: 'string' },
              value: { type: 'number' },
              expectedMin: { type: 'number' },
              expectedMax: { type: 'number' },
              metadata: { type: 'object', nullable: true },
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
        const check = await dataQualityCheckService.getDataQualityCheckById(id);
        
        if (!check) {
          return reply.status(404).send({ error: 'Data quality check not found' });
        }

        return reply.send(check);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Create data quality check
  fastify.post(
    '/',
    {
      schema: {
        description: 'Create a new data quality check',
        tags: ['Data Quality Checks'],
        body: {
          type: 'object',
          properties: {
            deviceId: { type: 'string' },
            checkType: { type: 'string' },
            status: { type: 'string' },
            message: { type: 'string' },
            value: { type: 'number' },
            expectedMin: { type: 'number' },
            expectedMax: { type: 'number' },
            metadata: { type: 'object', nullable: true },
          },
          required: ['deviceId', 'checkType', 'status', 'message', 'value', 'expectedMin', 'expectedMax'],
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              deviceId: { type: 'string' },
              checkType: { type: 'string' },
              status: { type: 'string' },
              message: { type: 'string' },
              value: { type: 'number' },
              expectedMin: { type: 'number' },
              expectedMax: { type: 'number' },
              metadata: { type: 'object', nullable: true },
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
        const check = await dataQualityCheckService.createDataQualityCheck(request.body as any);
        return reply.status(201).send(check);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Delete data quality check
  fastify.delete(
    '/:id',
    {
      schema: {
        description: 'Delete a data quality check',
        tags: ['Data Quality Checks'],
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
        await dataQualityCheckService.deleteDataQualityCheck(id);
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
