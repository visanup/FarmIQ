import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ExternalDataSourceService } from '../services/externalDataSource.service';

const externalDataSourceService = new ExternalDataSourceService();

export default async function externalDataSourceRoutes(fastify: FastifyInstance) {
  // Get all external data sources
  fastify.get('/', {
    schema: {
      description: 'Get all external data sources',
      tags: ['external-data-sources'],
      security: [{ apiKey: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
          type: { type: 'string' },
          status: { type: 'string' },
          search: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  type: { type: 'string' },
                  apiUrl: { type: 'string' },
                  apiKey: { type: 'string' },
                  status: { type: 'string' },
                  description: { type: 'string' },
                  meta: { type: 'object' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' }
                }
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                limit: { type: 'number' },
                total: { type: 'number' },
                totalPages: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { page = 1, limit = 10, type, status, search } = request.query as any;
      const result = await externalDataSourceService.getAllExternalDataSources({ 
        page, 
        limit, 
        type, 
        status, 
        search 
      });
      return reply.send(result);
    } catch (error) {
      return reply.status(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  });

  // Get external data source by ID
  fastify.get('/:id', {
    schema: {
      description: 'Get external data source by ID',
      tags: ['external-data-sources'],
      security: [{ apiKey: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                type: { type: 'string' },
                apiUrl: { type: 'string' },
                apiKey: { type: 'string' },
                status: { type: 'string' },
                description: { type: 'string' },
                meta: { type: 'object' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean', default: false },
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await externalDataSourceService.getExternalDataSourceById(id);
      return reply.send(result);
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        return reply.status(404).send({ success: false, error: 'Not Found', message: (error as Error).message });
      }
      return reply.status(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  });

  // Create new external data source
  fastify.post('/', {
    schema: {
      description: 'Create new external data source',
      tags: ['external-data-sources'],
      security: [{ apiKey: [] }],
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1 },
          type: { type: 'string' },
          apiUrl: { type: 'string' },
          apiKey: { type: 'string' },
          status: { type: 'string', enum: ['active', 'inactive', 'error'] },
          description: { type: 'string' },
          meta: { type: 'object' }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                type: { type: 'string' },
                apiUrl: { type: 'string' },
                apiKey: { type: 'string' },
                status: { type: 'string' },
                description: { type: 'string' },
                meta: { type: 'object' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            },
            message: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean', default: false },
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.body as any;
      const result = await externalDataSourceService.createExternalDataSource(data);
      return reply.status(201).send(result);
    } catch (error) {
      if ((error as Error).message.includes('already exists')) {
        return reply.status(400).send({ success: false, error: 'Bad Request', message: (error as Error).message });
      }
      return reply.status(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  });

  // Update external data source
  fastify.put('/:id', {
    schema: {
      description: 'Update external data source',
      tags: ['external-data-sources'],
      security: [{ apiKey: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
          type: { type: 'string' },
          apiUrl: { type: 'string' },
          apiKey: { type: 'string' },
          status: { type: 'string', enum: ['active', 'inactive', 'error'] },
          description: { type: 'string' },
          meta: { type: 'object' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                type: { type: 'string' },
                apiUrl: { type: 'string' },
                apiKey: { type: 'string' },
                status: { type: 'string' },
                description: { type: 'string' },
                meta: { type: 'object' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            },
            message: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean', default: false },
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const data = request.body as any;
      const result = await externalDataSourceService.updateExternalDataSource(id, data);
      return reply.send(result);
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        return reply.status(404).send({ success: false, error: 'Not Found', message: (error as Error).message });
      }
      return reply.status(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  });

  // Delete external data source
  fastify.delete('/:id', {
    schema: {
      description: 'Delete external data source',
      tags: ['external-data-sources'],
      security: [{ apiKey: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean', default: false },
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await externalDataSourceService.deleteExternalDataSource(id);
      return reply.send(result);
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        return reply.status(404).send({ success: false, error: 'Not Found', message: (error as Error).message });
      }
      return reply.status(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  });
}