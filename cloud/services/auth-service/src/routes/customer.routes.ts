import { FastifyInstance } from 'fastify';
import { CustomerService } from '../services/customer.service';
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  CustomerResponseSchema,
} from '../schemas/auth.schemas';
import { authenticateToken } from '../middleware/auth.middleware';

const customerService = new CustomerService();

export async function customerRoutes(fastify: FastifyInstance) {
  // Get all customers
  fastify.get(
    '/',
    {
      preHandler: [authenticateToken],
      schema: {
        description: 'Get all customers',
        tags: ['Customers'],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', default: 1 },
            limit: { type: 'number', default: 10 },
            search: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              customers: {
                type: 'array',
                items: CustomerResponseSchema,
              },
              total: { type: 'number' },
              page: { type: 'number' },
              limit: { type: 'number' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { page = 1, limit = 10, search } = request.query as any;
        const result = await customerService.getCustomers(page, limit, search);
        return reply.send(result);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Get customer by ID
  fastify.get(
    '/:id',
    {
      preHandler: [authenticateToken],
      schema: {
        description: 'Get customer by ID',
        tags: ['Customers'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          200: CustomerResponseSchema,
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const customer = await customerService.getCustomerById(id);
        
        if (!customer) {
          return reply.status(404).send({ error: 'Customer not found' });
        }

        return reply.send(customer);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Create customer
  fastify.post(
    '/',
    {
      preHandler: [authenticateToken],
      schema: {
        description: 'Create a new customer',
        tags: ['Customers'],
        body: CreateCustomerSchema,
        response: {
          201: CustomerResponseSchema,
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const user = (request as any).user;
        const customer = await customerService.createCustomer(
          request.body as any,
          user.userId
        );
        return reply.status(201).send(customer);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Update customer
  fastify.put(
    '/:id',
    {
      preHandler: [authenticateToken],
      schema: {
        description: 'Update customer',
        tags: ['Customers'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        body: UpdateCustomerSchema,
        response: {
          200: CustomerResponseSchema,
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const customer = await customerService.updateCustomer(id, request.body as any);
        return reply.send(customer);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Delete customer
  fastify.delete(
    '/:id',
    {
      preHandler: [authenticateToken],
      schema: {
        description: 'Delete customer',
        tags: ['Customers'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        await customerService.deleteCustomer(id);
        return reply.send({ message: 'Customer deleted successfully' });
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );
}

