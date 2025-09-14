import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { FarmService } from '../services/farm.service';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { z } from 'zod';

const farmService = new FarmService();

// Validation schemas
const createFarmSchema = z.object({
  farmId: z.string().min(1),
  customerId: z.string().min(1),
  name: z.string().min(1),
  location: z.object({
    lat: z.number(),
    lon: z.number(),
    address: z.string().optional()
  }),
  region: z.string().optional(),
  farmType: z.string().optional(),
  totalArea: z.number().optional(),
  meta: z.record(z.any()).optional()
});

const updateFarmSchema = createFarmSchema.partial();

const farmFiltersSchema = z.object({
  customerId: z.string().optional(),
  region: z.string().optional(),
  farmType: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0)
});

export default async function farmRoutes(fastify: FastifyInstance) {
  // Create farm
  fastify.post('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Create a new farm',
      tags: ['farms'],
      security: [{ apiKey: [] }],
      body: {
        type: 'object',
        required: ['farmId', 'customerId', 'name', 'location'],
        properties: {
          farmId: { type: 'string', description: 'Unique farm identifier' },
          customerId: { type: 'string', description: 'Customer ID' },
          name: { type: 'string', description: 'Farm name' },
          location: {
            type: 'object',
            required: ['lat', 'lon'],
            properties: {
              lat: { type: 'number', description: 'Latitude' },
              lon: { type: 'number', description: 'Longitude' },
              address: { type: 'string', description: 'Physical address' }
            }
          },
          region: { type: 'string', description: 'Farm region' },
          farmType: { type: 'string', description: 'Type of farm (poultry, livestock, mixed)' },
          totalArea: { type: 'number', description: 'Total farm area in square meters' },
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
                farmId: { type: 'string' },
                customerId: { type: 'string' },
                name: { type: 'string' },
                location: { type: 'object' },
                region: { type: 'string' },
                farmType: { type: 'string' },
                totalArea: { type: 'number' },
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
      const data = createFarmSchema.parse(request.body);
      const result = await farmService.createFarm(data);
      
      return reply.status(201).send(result);
    } catch (error) {
      throw error;
    }
  });

  // Get all farms
  fastify.get('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get all farms with optional filtering',
      tags: ['farms'],
      security: [{ apiKey: [] }],
      querystring: {
        type: 'object',
        properties: {
          customerId: { type: 'string' },
          region: { type: 'string' },
          farmType: { type: 'string' },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
          offset: { type: 'number', minimum: 0, default: 0 }
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
                  farmId: { type: 'string' },
                  customerId: { type: 'string' },
                  name: { type: 'string' },
                  location: { type: 'object' },
                  region: { type: 'string' },
                  farmType: { type: 'string' },
                  totalArea: { type: 'number' },
                  meta: { type: 'object' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' }
                }
              }
            },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                limit: { type: 'number' },
                offset: { type: 'number' },
                hasMore: { type: 'boolean' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const filters = farmFiltersSchema.parse(request.query);
      const result = await farmService.getAllFarms(filters);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });

  // Get farm by ID
  fastify.get('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get farm by ID',
      tags: ['farms'],
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
      const result = await farmService.getFarmById(id);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });

  // Update farm
  fastify.put('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Update farm by ID',
      tags: ['farms'],
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
          farmId: { type: 'string' },
          customerId: { type: 'string' },
          name: { type: 'string' },
          location: { type: 'object' },
          region: { type: 'string' },
          farmType: { type: 'string' },
          totalArea: { type: 'number' },
          meta: { type: 'object' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const data = updateFarmSchema.parse(request.body);
      const result = await farmService.updateFarm(id, data);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });

  // Delete farm
  fastify.delete('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Delete farm by ID',
      tags: ['farms'],
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
      const result = await farmService.deleteFarm(id);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });
}