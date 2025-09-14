import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { HouseService } from '../services/house.service';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { z } from 'zod';

const houseService = new HouseService();

// Validation schemas
const createHouseSchema = z.object({
  houseId: z.string().min(1),
  farmId: z.string().min(1),
  name: z.string().min(1),
  type: z.string().optional(),
  capacity: z.number().optional(),
  dimensions: z.object({
    length: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional()
  }).optional(),
  meta: z.record(z.any()).optional()
});

const updateHouseSchema = createHouseSchema.partial();

const houseFiltersSchema = z.object({
  farmId: z.string().optional(),
  type: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0)
});

export default async function houseRoutes(fastify: FastifyInstance) {
  // Create house
  fastify.post('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Create a new house',
      tags: ['houses'],
      security: [{ apiKey: [] }],
      body: {
        type: 'object',
        required: ['houseId', 'farmId', 'name'],
        properties: {
          houseId: { type: 'string', description: 'Unique house identifier' },
          farmId: { type: 'string', description: 'Farm ID' },
          name: { type: 'string', description: 'House name' },
          type: { type: 'string', description: 'Type of house (broiler, layer, breeding)' },
          capacity: { type: 'number', description: 'House capacity' },
          dimensions: {
            type: 'object',
            properties: {
              length: { type: 'number', description: 'House length in meters' },
              width: { type: 'number', description: 'House width in meters' },
              height: { type: 'number', description: 'House height in meters' }
            }
          },
          meta: { type: 'object', description: 'Additional metadata' }
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
                houseId: { type: 'string' },
                farmId: { type: 'string' },
                name: { type: 'string' },
                type: { type: 'string' },
                capacity: { type: 'number' },
                dimensions: { type: 'object' },
                meta: { type: 'object' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' }
              }
            },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = createHouseSchema.parse(request.body);
      const result = await houseService.createHouse(data);
      
      return reply.status(201).send(result);
    } catch (error) {
      throw error;
    }
  });

  // Get all houses
  fastify.get('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get all houses with optional filtering',
      tags: ['houses'],
      security: [{ apiKey: [] }],
      querystring: {
        type: 'object',
        properties: {
          farmId: { type: 'string' },
          type: { type: 'string' },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
          offset: { type: 'number', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const filters = houseFiltersSchema.parse(request.query);
      const result = await houseService.getAllHouses(filters);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });

  // Get house by ID
  fastify.get('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get house by ID',
      tags: ['houses'],
      security: [{ apiKey: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await houseService.getHouseById(id);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });

  // Update house
  fastify.put('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Update house by ID',
      tags: ['houses'],
      security: [{ apiKey: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          houseId: { type: 'string' },
          farmId: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string' },
          capacity: { type: 'number' },
          dimensions: { type: 'object' },
          meta: { type: 'object' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const data = updateHouseSchema.parse(request.body);
      const result = await houseService.updateHouse(id, data);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });

  // Delete house
  fastify.delete('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Delete house by ID',
      tags: ['houses'],
      security: [{ apiKey: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await houseService.deleteHouse(id);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });
}