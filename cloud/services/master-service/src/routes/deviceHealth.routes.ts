import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { DeviceHealthService, CreateDeviceHealthData, UpdateDeviceHealthData } from '../services/deviceHealth.service';

const deviceHealthService = new DeviceHealthService();

export default async function deviceHealthRoutes(fastify: FastifyInstance) {
  // Get all device health records
  fastify.get('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get all device health records',
      tags: ['device-health'],
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
                  deviceId: { type: 'string' },
                  status: { type: 'string' },
                  lastSeen: { type: 'string', format: 'date-time' },
                  batteryLevel: { type: 'number' },
                  signalStrength: { type: 'number' },
                  temperature: { type: 'number' },
                  errors: { type: 'array', items: { type: 'string' } },
                  warnings: { type: 'array', items: { type: 'string' } },
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
      const deviceHealthRecords = await deviceHealthService.getAllDeviceHealth();
      return reply.send({ success: true, data: deviceHealthRecords });
    } catch (error) {
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Get device health by ID
  fastify.get<{ Params: { id: string } }>('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get device health record by ID',
      tags: ['device-health'],
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
      const deviceHealth = await deviceHealthService.getDeviceHealthById(request.params.id);
      if (!deviceHealth) {
        return reply.status(404).send({ success: false, error: 'Device health record not found' });
      }
      return reply.send({ success: true, data: deviceHealth });
    } catch (error) {
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Get device health by device ID
  fastify.get<{ Params: { deviceId: string } }>('/device/:deviceId', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get device health record by device ID',
      tags: ['device-health'],
      security: [{ apiKey: [] }],
      params: {
        type: 'object',
        properties: {
          deviceId: { type: 'string' }
        },
        required: ['deviceId']
      }
    }
  }, async (request, reply) => {
    try {
      const deviceHealth = await deviceHealthService.getDeviceHealthByDeviceId(request.params.deviceId);
      if (!deviceHealth) {
        return reply.status(404).send({ success: false, error: 'Device health record not found' });
      }
      return reply.send({ success: true, data: deviceHealth });
    } catch (error) {
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Create device health record
  fastify.post<{ Body: CreateDeviceHealthData }>('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Create a new device health record',
      tags: ['device-health'],
      security: [{ apiKey: [] }],
      body: {
        type: 'object',
        properties: {
          deviceId: { type: 'string' },
          status: { type: 'string' },
          lastSeen: { type: 'string', format: 'date-time' },
          batteryLevel: { type: 'number' },
          signalStrength: { type: 'number' },
          temperature: { type: 'number' },
          errors: { type: 'array', items: { type: 'string' } },
          warnings: { type: 'array', items: { type: 'string' } },
          meta: { type: 'object' }
        },
        required: ['deviceId', 'status', 'lastSeen']
      }
    }
  }, async (request, reply) => {
    try {
      const deviceHealth = await deviceHealthService.createDeviceHealth(request.body);
      return reply.status(201).send({ success: true, data: deviceHealth });
    } catch (error) {
      return reply.status(400).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Update device health record
  fastify.put<{ Params: { id: string }, Body: UpdateDeviceHealthData }>('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Update device health record',
      tags: ['device-health'],
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
          status: { type: 'string' },
          lastSeen: { type: 'string', format: 'date-time' },
          batteryLevel: { type: 'number' },
          signalStrength: { type: 'number' },
          temperature: { type: 'number' },
          errors: { type: 'array', items: { type: 'string' } },
          warnings: { type: 'array', items: { type: 'string' } },
          meta: { type: 'object' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const deviceHealth = await deviceHealthService.updateDeviceHealth(request.params.id, request.body);
      return reply.send({ success: true, data: deviceHealth });
    } catch (error) {
      return reply.status(400).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Update device health record by device ID
  fastify.put<{ Params: { deviceId: string }, Body: UpdateDeviceHealthData }>('/device/:deviceId', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Update device health record by device ID',
      tags: ['device-health'],
      security: [{ apiKey: [] }],
      params: {
        type: 'object',
        properties: {
          deviceId: { type: 'string' }
        },
        required: ['deviceId']
      },
      body: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          lastSeen: { type: 'string', format: 'date-time' },
          batteryLevel: { type: 'number' },
          signalStrength: { type: 'number' },
          temperature: { type: 'number' },
          errors: { type: 'array', items: { type: 'string' } },
          warnings: { type: 'array', items: { type: 'string' } },
          meta: { type: 'object' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const deviceHealth = await deviceHealthService.updateDeviceHealthByDeviceId(request.params.deviceId, request.body);
      return reply.send({ success: true, data: deviceHealth });
    } catch (error) {
      return reply.status(400).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Delete device health record
  fastify.delete<{ Params: { id: string } }>('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Delete device health record',
      tags: ['device-health'],
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
      const result = await deviceHealthService.deleteDeviceHealth(request.params.id);
      return reply.send(result);
    } catch (error) {
      return reply.status(400).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Clear all device health records
  fastify.delete('/clear', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Clear all device health records',
      tags: ['device-health'],
      security: [{ apiKey: [] }]
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await deviceHealthService.clearAllDeviceHealth();
      return reply.send(result);
    } catch (error) {
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
}


