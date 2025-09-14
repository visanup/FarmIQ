import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DeviceService } from '../services/device.service';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { z } from 'zod';

const deviceService = new DeviceService();

// Validation schemas
const createDeviceSchema = z.object({
  deviceId: z.string().min(1),
  houseId: z.string().min(1),
  name: z.string().min(1),
  type: z.string().optional(),
  status: z.string().optional(),
  meta: z.record(z.any()).optional()
});

const updateDeviceSchema = createDeviceSchema.partial();

const deviceFiltersSchema = z.object({
  houseId: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0)
});

export default async function deviceRoutes(fastify: FastifyInstance) {
  // Create device
  fastify.post('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Create a new device',
      tags: ['devices'],
      security: [{ apiKey: [] }],
      body: {
        type: 'object',
        required: ['deviceId', 'houseId', 'name'],
        properties: {
          deviceId: { type: 'string', description: 'Unique device identifier' },
          houseId: { type: 'string', description: 'House ID' },
          name: { type: 'string', description: 'Device name' },
          type: { type: 'string', description: 'Type of device (sensor, controller, monitor)' },
          status: { type: 'string', description: 'Device status (active, inactive, maintenance)' },
          meta: { type: 'object', description: 'Additional metadata' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = createDeviceSchema.parse(request.body);
      const result = await deviceService.createDevice(data);
      
      return reply.status(201).send(result);
    } catch (error) {
      throw error;
    }
  });

  // Get all devices
  fastify.get('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get all devices with optional filtering',
      tags: ['devices'],
      security: [{ apiKey: [] }],
      querystring: {
        type: 'object',
        properties: {
          houseId: { type: 'string' },
          type: { type: 'string' },
          status: { type: 'string' },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
          offset: { type: 'number', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const filters = deviceFiltersSchema.parse(request.query);
      const result = await deviceService.getAllDevices(filters);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });

  // Get device by ID
  fastify.get('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get device by ID',
      tags: ['devices'],
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
      const result = await deviceService.getDeviceById(id);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });

  // Update device
  fastify.put('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Update device by ID',
      tags: ['devices'],
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
      const data = updateDeviceSchema.parse(request.body);
      const result = await deviceService.updateDevice(id, data);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });

  // Delete device
  fastify.delete('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Delete device by ID',
      tags: ['devices'],
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
      const result = await deviceService.deleteDevice(id);
      
      return reply.send(result);
    } catch (error) {
      throw error;
    }
  });
}