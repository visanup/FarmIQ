import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { BreedService } from '../services/breed.service';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { CreateBreedRequest } from '../types';

const breedService = new BreedService();

// Request schemas
const createBreedSchema = {
  body: {
    type: 'object',
    required: ['animalTypeId', 'name'],
    properties: {
      animalTypeId: { type: 'string' },
      name: { type: 'string' },
      code: { type: 'string' },
      description: { type: 'string' },
      characteristics: { type: 'object' },
      meta: { type: 'object' }
    }
  }
};

const updateBreedSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' }
    }
  },
  body: {
    type: 'object',
    properties: {
      animalTypeId: { type: 'string' },
      name: { type: 'string' },
      code: { type: 'string' },
      description: { type: 'string' },
      characteristics: { type: 'object' },
      meta: { type: 'object' }
    }
  }
};

const getBreedSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' }
    }
  }
};

const getBreedsSchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', minimum: 1, default: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
      animalTypeId: { type: 'string' },
      search: { type: 'string' }
    }
  }
};

const getBreedsByAnimalTypeSchema = {
  params: {
    type: 'object',
    required: ['animalTypeId'],
    properties: {
      animalTypeId: { type: 'string' }
    }
  }
};

async function breedRoutes(fastify: FastifyInstance) {
  // Create breed
  fastify.post('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Create a new breed',
      tags: ['breeds'],
      security: [{ apiKey: [] }],
      ...createBreedSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                animalTypeId: { type: 'string' },
                name: { type: 'string' },
                code: { type: 'string' },
                description: { type: 'string' },
                characteristics: { type: 'object' },
                meta: { type: 'object' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            },
            message: { type: 'string' }
          }
        }
      }
    },
    handler: async (
      request: FastifyRequest<{ Body: CreateBreedRequest }>,
      reply: FastifyReply
    ) => {
      try {
        const result = await breedService.createBreed(request.body);
        reply.code(201).send(result);
      } catch (error) {
        fastify.log.error(error);
        reply.code(400).send({
          success: false,
          message: error instanceof Error ? error.message : 'Failed to create breed'
        });
      }
    }
  });

  // Get all breeds with pagination and filtering
  fastify.get('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get all breeds with pagination and filtering',
      tags: ['breeds'],
      security: [{ apiKey: [] }],
      ...getBreedsSchema,
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
                  animalTypeId: { type: 'string' },
                  name: { type: 'string' },
                  code: { type: 'string' },
                  description: { type: 'string' },
                  characteristics: { type: 'object' },
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
    },
    handler: async (
      request: FastifyRequest<{
        Querystring: {
          page?: number;
          limit?: number;
          animalTypeId?: string;
          search?: string;
        }
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { page = 1, limit = 10, animalTypeId, search } = request.query;
        
        let result;
        if (search) {
          result = await breedService.searchBreeds(search, animalTypeId, page, limit);
        } else {
          result = await breedService.getAllBreeds(page, limit, animalTypeId);
        }
        
        reply.send(result);
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({
          success: false,
          message: error instanceof Error ? error.message : 'Failed to get breeds'
        });
      }
    }
  });

  // Get breed by ID
  fastify.get('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get breed by ID',
      tags: ['breeds'],
      security: [{ apiKey: [] }],
      ...getBreedSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                animalTypeId: { type: 'string' },
                name: { type: 'string' },
                code: { type: 'string' },
                description: { type: 'string' },
                characteristics: { type: 'object' },
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
            success: { type: 'boolean' },
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    },
    handler: async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const result = await breedService.getBreedById(request.params.id);
        reply.send(result);
      } catch (error) {
        fastify.log.error(error);
        const statusCode = error instanceof Error && error.message === 'Breed not found' ? 404 : 500;
        reply.code(statusCode).send({
          success: false,
          message: error instanceof Error ? error.message : 'Failed to get breed'
        });
      }
    }
  });

  // Get breeds by animal type
  fastify.get('/animal-types/:animalTypeId/breeds', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get breeds by animal type',
      tags: ['breeds'],
      security: [{ apiKey: [] }],
      ...getBreedsByAnimalTypeSchema,
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
                  animalTypeId: { type: 'string' },
                  name: { type: 'string' },
                  code: { type: 'string' },
                  description: { type: 'string' },
                  characteristics: { type: 'object' },
                  meta: { type: 'object' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        }
      }
    },
    handler: async (
      request: FastifyRequest<{ Params: { animalTypeId: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const result = await breedService.getBreedsByAnimalType(request.params.animalTypeId);
        reply.send(result);
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({
          success: false,
          message: error instanceof Error ? error.message : 'Failed to get breeds'
        });
      }
    }
  });

  // Update breed
  fastify.put('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Update breed by ID',
      tags: ['breeds'],
      security: [{ apiKey: [] }],
      ...updateBreedSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                animalTypeId: { type: 'string' },
                name: { type: 'string' },
                code: { type: 'string' },
                description: { type: 'string' },
                characteristics: { type: 'object' },
                meta: { type: 'object' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            },
            message: { type: 'string' }
          }
        }
      }
    },
    handler: async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: Partial<CreateBreedRequest>;
      }>,
      reply: FastifyReply
    ) => {
      try {
        const result = await breedService.updateBreed(request.params.id, request.body);
        reply.send(result);
      } catch (error) {
        fastify.log.error(error);
        const statusCode = error instanceof Error && error.message === 'Breed not found' ? 404 : 400;
        reply.code(statusCode).send({
          success: false,
          message: error instanceof Error ? error.message : 'Failed to update breed'
        });
      }
    }
  });

  // Delete breed
  fastify.delete('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Delete breed by ID',
      tags: ['breeds'],
      security: [{ apiKey: [] }],
      ...getBreedSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'null' },
            message: { type: 'string' }
          }
        }
      }
    },
    handler: async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const result = await breedService.deleteBreed(request.params.id);
        reply.send(result);
      } catch (error) {
        fastify.log.error(error);
        const statusCode = error instanceof Error && error.message === 'Breed not found' ? 404 : 400;
        reply.code(statusCode).send({
          success: false,
          message: error instanceof Error ? error.message : 'Failed to delete breed'
        });
      }
    }
  });
}

export default breedRoutes;