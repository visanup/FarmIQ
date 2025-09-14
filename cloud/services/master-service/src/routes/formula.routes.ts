import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { FormulaService } from '../services/formula.service';

const formulaService = new FormulaService();

export default async function formulaRoutes(fastify: FastifyInstance) {
  // Get all formulas
  fastify.get('/', {
    schema: {
      description: 'Get all formulas',
      tags: ['formulas'],
      security: [{ apiKey: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
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
                  description: { type: 'string' },
                  composition: { type: 'object' },
                  energy: { type: 'number' },
                  cost: { type: 'number' },
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
      const { page = 1, limit = 10, search } = request.query as any;
      const result = await formulaService.getAllFormulas({ page, limit, search });
      return reply.send(result);
    } catch (error) {
      return reply.status(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  });

  // Get formula by ID
  fastify.get('/:id', {
    schema: {
      description: 'Get formula by ID',
      tags: ['formulas'],
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
                description: { type: 'string' },
                composition: { type: 'object' },
                energy: { type: 'number' },
                cost: { type: 'number' },
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
      const result = await formulaService.getFormulaById(id);
      return reply.send(result);
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        return reply.status(404).send({ success: false, error: 'Not Found', message: (error as Error).message });
      }
      return reply.status(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  });

  // Create new formula
  fastify.post('/', {
    schema: {
      description: 'Create a new formula',
      tags: ['formulas'],
      security: [{ apiKey: [] }],
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          composition: { type: 'object' },
          energy: { type: 'number' },
          cost: { type: 'number' },
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
                description: { type: 'string' },
                composition: { type: 'object' },
                energy: { type: 'number' },
                cost: { type: 'number' },
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
      const result = await formulaService.createFormula(data);
      return reply.status(201).send(result);
    } catch (error) {
      if ((error as Error).message.includes('already exists')) {
        return reply.status(400).send({ success: false, error: 'Bad Request', message: (error as Error).message });
      }
      return reply.status(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  });

  // Update formula
  fastify.put('/:id', {
    schema: {
      description: 'Update formula',
      tags: ['formulas'],
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
          description: { type: 'string' },
          composition: { type: 'object' },
          energy: { type: 'number' },
          cost: { type: 'number' },
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
                description: { type: 'string' },
                composition: { type: 'object' },
                energy: { type: 'number' },
                cost: { type: 'number' },
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
      const result = await formulaService.updateFormula(id, data);
      return reply.send(result);
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        return reply.status(404).send({ success: false, error: 'Not Found', message: (error as Error).message });
      }
      return reply.status(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  });

  // Delete formula
  fastify.delete('/:id', {
    schema: {
      description: 'Delete formula',
      tags: ['formulas'],
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
      const result = await formulaService.deleteFormula(id);
      return reply.send(result);
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        return reply.status(404).send({ success: false, error: 'Not Found', message: (error as Error).message });
      }
      return reply.status(500).send({ success: false, error: 'Internal Server Error', message: (error as Error).message });
    }
  });
}