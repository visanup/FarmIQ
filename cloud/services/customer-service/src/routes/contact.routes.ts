import { FastifyInstance } from 'fastify';
import { ContactService } from '../services/contact.service';
import {
  CreateContactSchema,
  UpdateContactSchema,
  ContactResponseSchema,
  PaginationQuerySchema,
} from '../schemas/customer.schemas';

const contactService = new ContactService();

export async function contactRoutes(fastify: FastifyInstance) {
  // Get all contacts
  fastify.get(
    '/',
    {
      schema: {
        description: 'Get all contacts',
        tags: ['Contacts'],
        querystring: {
          allOf: [
            PaginationQuerySchema,
            {
              type: 'object',
              properties: {
                customerId: { type: 'string' },
              },
            },
          ],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              contacts: {
                type: 'array',
                items: ContactResponseSchema,
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
        const { customerId, ...pagination } = request.query as any;
        const result = await contactService.getContacts(pagination, customerId);
        return reply.send(result);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Get contact by ID
  fastify.get(
    '/:id',
    {
      schema: {
        description: 'Get contact by ID',
        tags: ['Contacts'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          200: ContactResponseSchema,
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
        const contact = await contactService.getContactById(id);
        
        if (!contact) {
          return reply.status(404).send({ error: 'Contact not found' });
        }

        return reply.send(contact);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Create contact
  fastify.post(
    '/',
    {
      schema: {
        description: 'Create a new contact',
        tags: ['Contacts'],
        body: CreateContactSchema,
        response: {
          201: ContactResponseSchema,
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
        const contact = await contactService.createContact(request.body as any);
        return reply.status(201).send(contact);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Update contact
  fastify.put(
    '/:id',
    {
      schema: {
        description: 'Update contact',
        tags: ['Contacts'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        body: UpdateContactSchema,
        response: {
          200: ContactResponseSchema,
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
        const contact = await contactService.updateContact(id, request.body as any);
        return reply.send(contact);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Delete contact
  fastify.delete(
    '/:id',
    {
      schema: {
        description: 'Delete contact',
        tags: ['Contacts'],
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
        await contactService.deleteContact(id);
        return reply.send({ message: 'Contact deleted successfully' });
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );
}

