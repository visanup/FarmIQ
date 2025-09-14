import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { EconomicDataService } from '../services/economicData.service';

const economicDataService = new EconomicDataService();

export default async function economicDataRoutes(fastify: FastifyInstance) {
  // Get all economic data
  fastify.get('/', {
    schema: {
      description: 'Get all economic data',
      tags: ['economic-data'],
      security: [{ apiKey: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
          dataType: { type: 'string' },
          region: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' }
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
                  dataType: { type: 'string' },
                  region: { type: 'string' },
                  value: { type: 'number' },
                  unit: { type: 'string' },
                  currency: { type: 'string' },
                  timestamp: { type: 'string', format: 'date-time' },
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
      const { page = 1, limit = 10, dataType, region, startDate, endDate } = request.query as any;
      const result = await economicDataService.getAllEconomicData({ 
        page, 
        limit, 
        dataType, 
        region, 
        startDate, 
        endDate 
      });
      return reply.send(result);
    } catch (error) {
      return reply.status(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  });

  // Get economic data by ID
  fastify.get('/:id', {
    schema: {
      description: 'Get economic data by ID',
      tags: ['economic-data'],
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
                dataType: { type: 'string' },
                region: { type: 'string' },
                value: { type: 'number' },
                unit: { type: 'string' },
                currency: { type: 'string' },
                timestamp: { type: 'string', format: 'date-time' },
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
      const result = await economicDataService.getEconomicDataById(id);
      return reply.send(result);
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        return reply.status(404).send({ success: false, error: 'Not Found', message: (error as Error).message });
      }
      return reply.status(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  });

  // Create new economic data
  fastify.post('/', {
    schema: {
      description: 'Create new economic data',
      tags: ['economic-data'],
      security: [{ apiKey: [] }],
      body: {
        type: 'object',
        required: ['dataType', 'value'],
        properties: {
          dataType: { type: 'string', minLength: 1 },
          region: { type: 'string' },
          value: { type: 'number' },
          unit: { type: 'string' },
          currency: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
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
                dataType: { type: 'string' },
                region: { type: 'string' },
                value: { type: 'number' },
                unit: { type: 'string' },
                currency: { type: 'string' },
                timestamp: { type: 'string', format: 'date-time' },
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
      const result = await economicDataService.createEconomicData(data);
      return reply.status(201).send(result);
    } catch (error) {
      return reply.status(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  });

  // Update economic data
  fastify.put('/:id', {
    schema: {
      description: 'Update economic data',
      tags: ['economic-data'],
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
          dataType: { type: 'string', minLength: 1 },
          region: { type: 'string' },
          value: { type: 'number' },
          unit: { type: 'string' },
          currency: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
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
                dataType: { type: 'string' },
                region: { type: 'string' },
                value: { type: 'number' },
                unit: { type: 'string' },
                currency: { type: 'string' },
                timestamp: { type: 'string', format: 'date-time' },
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
      const result = await economicDataService.updateEconomicData(id, data);
      return reply.send(result);
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        return reply.status(404).send({ success: false, error: 'Not Found', message: (error as Error).message });
      }
      return reply.status(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  });

  // Delete economic data
  fastify.delete('/:id', {
    schema: {
      description: 'Delete economic data',
      tags: ['economic-data'],
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
      const result = await economicDataService.deleteEconomicData(id);
      return reply.send(result);
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        return reply.status(404).send({ success: false, error: 'Not Found', message: (error as Error).message });
      }
      return reply.status(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  });
}