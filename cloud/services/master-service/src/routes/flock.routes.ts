import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { FlockService } from '../services/flock.service';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { z } from 'zod';

const flockService = new FlockService();

// Validation schemas
const createFlockSchema = z.object({
  flockId: z.string().min(1),
  farmId: z.string().min(1),
  houseId: z.string().min(1),
  animalTypeId: z.string().min(1),
  breedId: z.string().min(1),
  name: z.string().min(1),
  startDate: z.date().optional(),
  expectedEndDate: z.date().optional(),
  initialCount: z.number().optional(),
  currentCount: z.number().optional(),
  meta: z.record(z.any()).optional()
});

const updateFlockSchema = createFlockSchema.partial();

const flockFiltersSchema = z.object({
  farmId: z.string().optional(),
  houseId: z.string().optional(),
  animalTypeId: z.string().optional(),
  breedId: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0)
});

export default async function flockRoutes(fastify: FastifyInstance) {
  // Create flock
  fastify.post('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Create a new flock',
      tags: ['flocks'],
      security: [{ apiKey: [] }],
      body: {
        type: 'object',
        required: ['flockId', 'farmId', 'houseId', 'animalTypeId', 'breedId', 'name'],
        properties: {
          flockId: { type: 'string', description: 'Unique flock identifier' },
          farmId: { type: 'string', description: 'Farm ID' },
          houseId: { type: 'string', description: 'House ID' },
          animalTypeId: { type: 'string', description: 'Animal type ID' },
          breedId: { type: 'string', description: 'Breed ID' },
          name: { type: 'string', description: 'Flock name' },
          startDate: { type: 'string', format: 'date-time', description: 'Flock start date' },
          expectedEndDate: { type: 'string', format: 'date-time', description: 'Expected end date' },
          initialCount: { type: 'number', description: 'Initial animal count' },
          currentCount: { type: 'number', description: 'Current animal count' },
          meta: { type: 'object', description: 'Additional metadata' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = createFlockSchema.parse(request.body);
      const result = await flockService.createFlock(data);
      
      return reply.status(201).send(result);
    } catch (error) {
      throw error;
    }
  });

  // Get all flocks
  fastify.get('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get all flocks with optional filtering',
      tags: ['flocks'],
      security: [{ apiKey: [] }],
      querystring: {
        type: 'object',
        properties: {
          farmId: { type: 'string' },
          houseId: { type: 'string' },
          animalTypeId: { type: 'string' },
          breedId: { type: 'string' },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
          offset: { type: 'number', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const filters = flockFiltersSchema.parse(request.query);
      const result = await flockService.getAllFlocks(filters);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });

  // Get flock by ID
  fastify.get('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get flock by ID',
      tags: ['flocks'],
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
      const result = await flockService.getFlockById(id);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });

  // Update flock
  fastify.put('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Update flock by ID',
      tags: ['flocks'],
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
      const data = updateFlockSchema.parse(request.body);
      const result = await flockService.updateFlock(id, data);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });

  // Delete flock
  fastify.delete('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Delete flock by ID',
      tags: ['flocks'],
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
      const result = await flockService.deleteFlock(id);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });
}