import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { DeviceTypeService, CreateDeviceTypeData, UpdateDeviceTypeData } from '../services/deviceType.service';

const deviceTypeService = new DeviceTypeService();

export default async function deviceTypeRoutes(fastify: FastifyInstance) {
  // Get all device types
  fastify.get('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get all device types',
      tags: ['device-types'],
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
                  specifications: { type: 'object' },
                  meta: { type: 'object' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const deviceTypes = await deviceTypeService.getAllDeviceTypes();
      return reply.send({ success: true, data: deviceTypes });
    } catch (error) {
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Get device type by ID
  fastify.get<{ Params: { id: string } }>(':id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get device type by ID',
      tags: ['device-types'],
      security: [{ apiKey: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const deviceType = await deviceTypeService.getDeviceTypeById(request.params.id);
      if (!deviceType) {
        return reply.status(404).send({ success: false, error: 'Device type not found' });
      }
      return reply.send({ success: true, data: deviceType });
    } catch (error) {
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Create device type
  fastify.post<{ Body: CreateDeviceTypeData }>('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Create a new device type',
      tags: ['device-types'],
      security: [{ apiKey: [] }],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          category: { type: 'string' },
          description: { type: 'string' },
          specifications: { type: 'object' },
          meta: { type: 'object' }
        },
        required: ['name']
      }
    }
  }, async (request, reply) => {
    try {
      const deviceType = await deviceTypeService.createDeviceType(request.body);
      return reply.status(201).send({ success: true, data: deviceType });
    } catch (error) {
      return reply.status(400).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Update device type
  fastify.put<{ Params: { id: string }, Body: UpdateDeviceTypeData }>('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Update device type',
      tags: ['device-types'],
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
          name: { type: 'string' },
          category: { type: 'string' },
          description: { type: 'string' },
          specifications: { type: 'object' },
          meta: { type: 'object' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const deviceType = await deviceTypeService.updateDeviceType(request.params.id, request.body);
      return reply.send({ success: true, data: deviceType });
    } catch (error) {
      return reply.status(400).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Delete device type
  fastify.delete<{ Params: { id: string } }>('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Delete device type',
      tags: ['device-types'],
      security: [{ apiKey: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const result = await deviceTypeService.deleteDeviceType(request.params.id);
      return reply.send(result);
    } catch (error) {
      return reply.status(400).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Clear all device types
  fastify.delete('/clear', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Clear all device types',
      tags: ['device-types'],
      security: [{ apiKey: [] }]
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await deviceTypeService.clearAllDeviceTypes();
      return reply.send(result);
    } catch (error) {
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
}


