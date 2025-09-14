import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { FeedTypeService } from '../services/feedType.service';

const feedTypeService = new FeedTypeService();

export default async function feedTypeRoutes(fastify: FastifyInstance) {
  // Get all feed types
  fastify.get('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get all feed types',
      tags: ['feed-types'],
      security: [{ apiKey: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
          category: { type: 'string' },
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
                  category: { type: 'string' },
                  description: { type: 'string' },
                  nutritionalInfo: { type: 'object' },
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
      const { page = 1, limit = 10, category, search } = request.query as any;
      const result = await feedTypeService.getAllFeedTypes({ page, limit, category, search });
      return reply.send(result);
    } catch (error) {
      return reply.status(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  });

  // Get feed type by ID
  fastify.get('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get feed type by ID',
      tags: ['feed-types'],
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
                category: { type: 'string' },
                description: { type: 'string' },
                nutritionalInfo: { type: 'object' },
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
      const result = await feedTypeService.getFeedTypeById(id);
      return reply.send(result);
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        return reply.status(404).send({ success: false, error: 'Not Found', message: (error as Error).message });
      }
      return reply.status(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  });

  // Create feed type
  fastify.post('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Create a new feed type',
      tags: ['feed-types'],
      security: [{ apiKey: [] }],
      body: {
        type: 'object',
        required: ['name', 'category'],
        properties: {
          name: { type: 'string', minLength: 1 },
          category: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          nutritionalInfo: { type: 'object' },
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
                category: { type: 'string' },
                description: { type: 'string' },
                nutritionalInfo: { type: 'object' },
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
      const result = await feedTypeService.createFeedType(data);
      return reply.status(201).send(result);
    } catch (error) {
      if ((error as Error).message.includes('already exists')) {
        return reply.status(400).send({ success: false, error: 'Bad Request', message: (error as Error).message });
      }
      return reply.status(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  });

  // Update feed type
  fastify.put('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Update feed type by ID',
      tags: ['feed-types'],
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
          category: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          nutritionalInfo: { type: 'object' },
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
                category: { type: 'string' },
                description: { type: 'string' },
                nutritionalInfo: { type: 'object' },
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
      const result = await feedTypeService.updateFeedType(id, data);
      return reply.send(result);
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        return reply.status(404).send({ success: false, error: 'Not Found', message: (error as Error).message });
      }
      return reply.status(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  });

  // Delete feed type
  fastify.delete('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Delete feed type by ID',
      tags: ['feed-types'],
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
      const result = await feedTypeService.deleteFeedType(id);
      return reply.send(result);
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        return reply.status(404).send({ success: false, error: 'Not Found', message: (error as Error).message });
      }
      return reply.status(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  });
}
