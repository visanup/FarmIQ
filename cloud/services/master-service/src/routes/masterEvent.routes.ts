import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { MasterEventService } from '../services/masterEvent.service';

const masterEventService = new MasterEventService();

export default async function masterEventRoutes(fastify: FastifyInstance) {
  // Get all master events
  fastify.get('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get all master events',
      tags: ['master-events'],
      security: [{ apiKey: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
          eventType: { type: 'string' },
          entityType: { type: 'string' },
          entityId: { type: 'string' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' }
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
                  eventType: { type: 'string' },
                  entityType: { type: 'string' },
                  entityId: { type: 'string' },
                  data: { type: 'object' },
                  timestamp: { type: 'string' },
                  source: { type: 'string' },
                  meta: { type: 'object' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' }
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
      const { 
        page = 1, 
        limit = 10, 
        eventType, 
        entityType, 
        entityId, 
        startDate, 
        endDate 
      } = request.query as any;
      
      const result = await masterEventService.getAllMasterEvents({ 
        page, 
        limit, 
        eventType, 
        entityType, 
        entityId, 
        startDate, 
        endDate 
      });
      return reply.send(result);
    } catch (error) {
      return reply.status(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  });

  // Get master event by ID
  fastify.get('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get master event by ID',
      tags: ['master-events'],
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
                eventType: { type: 'string' },
                entityType: { type: 'string' },
                entityId: { type: 'string' },
                data: { type: 'object' },
                timestamp: { type: 'string' },
                source: { type: 'string' },
                meta: { type: 'object' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' }
              }
            }
          }
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await masterEventService.getMasterEventById(id);
      return reply.send(result);
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        return reply.status(404).send({ success: false, error: 'Not Found', message: (error as Error).message });
      }
      return reply.status(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  });

  // Create master event
  fastify.post('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Create new master event',
      tags: ['master-events'],
      security: [{ apiKey: [] }],
      body: {
        type: 'object',
        required: ['eventType', 'entityType', 'entityId', 'data'],
        properties: {
          eventType: { type: 'string', minLength: 1 },
          entityType: { type: 'string', minLength: 1 },
          entityId: { type: 'string', minLength: 1 },
          data: { type: 'object' },
          timestamp: { type: 'string', format: 'date-time' },
          source: { type: 'string' },
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
                eventType: { type: 'string' },
                entityType: { type: 'string' },
                entityId: { type: 'string' },
                data: { type: 'object' },
                timestamp: { type: 'string' },
                source: { type: 'string' },
                meta: { type: 'object' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' }
              }
            },
            message: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.body as any;
      const result = await masterEventService.createMasterEvent(data);
      return reply.status(201).send(result);
    } catch (error) {
      if ((error as Error).message.includes('already exists')) {
        return reply.status(400).send({ success: false, error: 'Bad Request', message: (error as Error).message });
      }
      return reply.status(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  });

  // Update master event
  fastify.put('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Update master event by ID',
      tags: ['master-events'],
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
          eventType: { type: 'string', minLength: 1 },
          entityType: { type: 'string', minLength: 1 },
          entityId: { type: 'string', minLength: 1 },
          data: { type: 'object' },
          timestamp: { type: 'string', format: 'date-time' },
          source: { type: 'string' },
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
                eventType: { type: 'string' },
                entityType: { type: 'string' },
                entityId: { type: 'string' },
                data: { type: 'object' },
                timestamp: { type: 'string' },
                source: { type: 'string' },
                meta: { type: 'object' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' }
              }
            },
            message: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
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
      const result = await masterEventService.updateMasterEvent(id, data);
      return reply.send(result);
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        return reply.status(404).send({ success: false, error: 'Not Found', message: (error as Error).message });
      }
      return reply.status(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  });

  // Delete master event
  fastify.delete('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Delete master event by ID',
      tags: ['master-events'],
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
            success: { type: 'boolean' },
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await masterEventService.deleteMasterEvent(id);
      return reply.send(result);
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        return reply.status(404).send({ success: false, error: 'Not Found', message: (error as Error).message });
      }
      return reply.status(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  });
}
