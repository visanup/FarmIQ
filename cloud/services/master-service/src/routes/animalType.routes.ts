import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AnimalTypeService } from '../services/animalType.service';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { z } from 'zod';

const animalTypeService = new AnimalTypeService();

// Validation schemas
const createAnimalTypeSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  description: z.string().optional(),
  meta: z.record(z.any()).optional()
});

const createBreedSchema = z.object({
  animalTypeId: z.string().min(1),
  name: z.string().min(1),
  code: z.string().optional(),
  description: z.string().optional(),
  characteristics: z.record(z.any()).optional(),
  meta: z.record(z.any()).optional()
});

export default async function animalTypeRoutes(fastify: FastifyInstance) {
  // =====================================================
  // ANIMAL TYPE ROUTES
  // =====================================================

  // Create animal type
  fastify.post('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Create a new animal type',
      tags: ['animal-types'],
      security: [{ apiKey: [] }],
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', description: 'Animal type name (e.g., Chicken, Pig, Cattle)' },
          category: { type: 'string', description: 'Category (e.g., Poultry, Livestock)' },
          description: { type: 'string', description: 'Animal type description' },
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
                name: { type: 'string' },
                category: { type: 'string' },
                description: { type: 'string' },
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
      const data = createAnimalTypeSchema.parse(request.body);
      const result = await animalTypeService.createAnimalType(data);
      
      return reply.status(201).send(result);
    } catch (error) {
      throw error;
    }
  });

  // Get all animal types
  fastify.get('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get all animal types',
      tags: ['animal-types'],
      security: [{ apiKey: [] }],
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
                  meta: { type: 'object' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await animalTypeService.getAllAnimalTypes();
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });

  // Get animal type by ID
  fastify.get('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get animal type by ID with breeds',
      tags: ['animal-types'],
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
      const result = await animalTypeService.getAnimalTypeById(id);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });

  // Update animal type
  fastify.put('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Update animal type by ID',
      tags: ['animal-types'],
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
          name: { type: 'string' },
          category: { type: 'string' },
          description: { type: 'string' },
          meta: { type: 'object' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const data = createAnimalTypeSchema.partial().parse(request.body);
      const result = await animalTypeService.updateAnimalType(id, data);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });

  // Delete animal type
  fastify.delete('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Delete animal type by ID',
      tags: ['animal-types'],
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
      const result = await animalTypeService.deleteAnimalType(id);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });

  // =====================================================
  // BREED ROUTES
  // =====================================================

  // Create breed
  fastify.post('/breeds', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Create a new breed',
      tags: ['breeds'],
      security: [{ apiKey: [] }],
      body: {
        type: 'object',
        required: ['animalTypeId', 'name'],
        properties: {
          animalTypeId: { type: 'string', description: 'Animal type ID' },
          name: { type: 'string', description: 'Breed name (e.g., Ross 308, Cobb 500)' },
          code: { type: 'string', description: 'Breed code (e.g., R308, C500)' },
          description: { type: 'string', description: 'Breed description' },
          characteristics: { 
            type: 'object', 
            description: 'Breed characteristics (e.g., growth_rate, feed_conversion)' 
          },
          meta: { type: 'object', description: 'Additional metadata' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = createBreedSchema.parse(request.body);
      const result = await animalTypeService.createBreed(data);
      
      return reply.status(201).send(result);
    } catch (error) {
      throw error;
    }
  });

  // Get all breeds
  fastify.get('/breeds', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get all breeds with animal types',
      tags: ['breeds'],
      security: [{ apiKey: [] }]
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await animalTypeService.getAllBreeds();
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });

  // Get breeds by animal type
  fastify.get('/:animalTypeId/breeds', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get breeds by animal type ID',
      tags: ['breeds'],
      security: [{ apiKey: [] }],
      params: {
        type: 'object',
        properties: {
          animalTypeId: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { animalTypeId } = request.params as { animalTypeId: string };
      const result = await animalTypeService.getBreedsByAnimalType(animalTypeId);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });

  // Get breed by ID
  fastify.get('/breeds/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get breed by ID',
      tags: ['breeds'],
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
      const result = await animalTypeService.getBreedById(id);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });

  // Update breed
  fastify.put('/breeds/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Update breed by ID',
      tags: ['breeds'],
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
          name: { type: 'string' },
          code: { type: 'string' },
          description: { type: 'string' },
          characteristics: { type: 'object' },
          meta: { type: 'object' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const data = createBreedSchema.partial().parse(request.body);
      const result = await animalTypeService.updateBreed(id, data);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });

  // Delete breed
  fastify.delete('/breeds/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Delete breed by ID',
      tags: ['breeds'],
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
      const result = await animalTypeService.deleteBreed(id);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });
}
