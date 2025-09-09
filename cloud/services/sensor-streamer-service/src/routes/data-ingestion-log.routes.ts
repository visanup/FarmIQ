import { FastifyInstance } from 'fastify';
import { DataIngestionLogService } from '../services/data-ingestion-log.service';

const dataIngestionLogService = new DataIngestionLogService();

export async function dataIngestionLogRoutes(fastify: FastifyInstance) {
  // Get all data ingestion logs
  fastify.get(
    '/',
    {
      schema: {
        description: 'Get all data ingestion logs',
        tags: ['Data Ingestion Logs'],
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'number', default: 50 },
          },
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                source: { type: 'string' },
                dataType: { type: 'string' },
                recordCount: { type: 'number' },
                status: { type: 'string' },
                errorMessage: { type: 'string', nullable: true },
                metadata: { type: 'object', nullable: true },
                timestamp: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { limit = 50 } = request.query as { limit?: number };
        const logs = await dataIngestionLogService.getRecentLogs(limit);
        return reply.send(logs);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Create data ingestion log
  fastify.post(
    '/',
    {
      schema: {
        description: 'Create a new data ingestion log',
        tags: ['Data Ingestion Logs'],
        body: {
            type: 'object',
            properties: {
              source: { type: 'string' },
              dataType: { type: 'string' },
              recordCount: { type: 'number' },
              status: { type: 'string' },
              errorMessage: { type: 'string', nullable: true },
              metadata: { type: 'object', nullable: true },
              timestamp: { type: 'string', format: 'date-time' },
            },
            required: ['source', 'dataType', 'recordCount', 'status', 'timestamp'],
          },
        response: {
          201: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                source: { type: 'string' },
                dataType: { type: 'string' },
                recordCount: { type: 'number' },
                status: { type: 'string' },
                errorMessage: { type: 'string', nullable: true },
                metadata: { type: 'object', nullable: true },
                timestamp: { type: 'string', format: 'date-time' },
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
        const log = await dataIngestionLogService.createLog(request.body as any);
        return reply.status(201).send(log);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Get logs by source
  fastify.get(
    '/source/:source',
    {
      schema: {
        description: 'Get data ingestion logs by source',
        tags: ['Data Ingestion Logs'],
        params: {
          type: 'object',
          properties: {
            source: { type: 'string' },
          },
          required: ['source'],
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                source: { type: 'string' },
                dataType: { type: 'string' },
                recordCount: { type: 'number' },
                status: { type: 'string' },
                errorMessage: { type: 'string', nullable: true },
                metadata: { type: 'object', nullable: true },
                timestamp: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { source } = request.params as { source: string };
        const logs = await dataIngestionLogService.getLogsBySource(source);
        return reply.send(logs);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Get logs by data type
  fastify.get(
    '/data-type/:dataType',
    {
      schema: {
        description: 'Get data ingestion logs by data type',
        tags: ['Data Ingestion Logs'],
        params: {
          type: 'object',
          properties: {
            dataType: { type: 'string' },
          },
          required: ['dataType'],
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                source: { type: 'string' },
                dataType: { type: 'string' },
                recordCount: { type: 'number' },
                status: { type: 'string' },
                errorMessage: { type: 'string', nullable: true },
                metadata: { type: 'object', nullable: true },
                timestamp: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { dataType } = request.params as { dataType: string };
        const logs = await dataIngestionLogService.getLogsByDataType(dataType);
        return reply.send(logs);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );
}
