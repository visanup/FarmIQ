import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CustomerService } from '../services/customer.service';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { z } from 'zod';

const customerService = new CustomerService();

// Validation schemas
const createCustomerSchema = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  meta: z.record(z.any()).optional()
});

const updateCustomerSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  meta: z.record(z.any()).optional()
});

const querySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10')
});

export default async function customerRoutes(fastify: FastifyInstance) {
  // Create customer
  fastify.post('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Create a new customer',
      tags: ['customers'],
      security: [{ apiKey: [] }],
      body: {
        type: 'object',
        required: ['tenantId', 'name'],
        properties: {
          tenantId: { type: 'string', description: 'Unique tenant identifier' },
          name: { type: 'string', description: 'Customer name' },
          email: { type: 'string', format: 'email', description: 'Customer email' },
          phone: { type: 'string', description: 'Customer phone number' },
          address: { type: 'string', description: 'Customer address' },
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
                tenantId: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                address: { type: 'string' },
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
      const data = createCustomerSchema.parse(request.body);
      const result = await customerService.createCustomer(data);
      
      return reply.status(201).send(result);
    } catch (error) {
      throw error;
    }
  });

  // Get all customers
  fastify.get('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get all customers with pagination',
      tags: ['customers'],
      security: [{ apiKey: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'string', default: '1' },
          limit: { type: 'string', default: '10' }
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
                  tenantId: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
                  address: { type: 'string' },
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
      const { page, limit } = querySchema.parse(request.query);
      const result = await customerService.getAllCustomers(page, limit);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });

  // Get customer by ID
  fastify.get('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get customer by ID',
      tags: ['customers'],
      security: [{ apiKey: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
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
                tenantId: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                address: { type: 'string' },
                meta: { type: 'object' },
                farms: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      farmId: { type: 'string' },
                      name: { type: 'string' },
                      location: { type: 'object' },
                      region: { type: 'string' },
                      farmType: { type: 'string' },
                      totalArea: { type: 'number' },
                      houses: { type: 'array' },
                      flocks: { type: 'array' }
                    }
                  }
                },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await customerService.getCustomerById(id);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });

  // Get customer by tenant ID
  fastify.get('/tenant/:tenantId', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get customer by tenant ID',
      tags: ['customers'],
      security: [{ apiKey: [] }],
      params: {
        type: 'object',
        properties: {
          tenantId: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tenantId } = request.params as { tenantId: string };
      const result = await customerService.getCustomerByTenantId(tenantId);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });

  // Update customer
  fastify.put('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Update customer by ID',
      tags: ['customers'],
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
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          address: { type: 'string' },
          meta: { type: 'object' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const data = updateCustomerSchema.parse(request.body);
      const result = await customerService.updateCustomer(id, data);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });

  // Delete customer
  fastify.delete('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Delete customer by ID',
      tags: ['customers'],
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
      const result = await customerService.deleteCustomer(id);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });
}
