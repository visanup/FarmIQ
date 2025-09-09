import { FastifyInstance } from 'fastify';
import { DeviceHealthService } from '../services/device-health.service';

const deviceHealthService = new DeviceHealthService();

export async function deviceHealthRoutes(fastify: FastifyInstance) {
  // Get all device health
  fastify.get(
    '/',
    {
      schema: {
        description: 'Get all device health status',
        tags: ['Device Health'],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                deviceId: { type: 'string' },
                status: { type: 'string' },
                lastSeen: { type: 'string', format: 'date-time' },
                batteryLevel: { type: 'number', nullable: true },
                signalStrength: { type: 'number', nullable: true },
                temperature: { type: 'number', nullable: true },
                errors: { type: 'array', items: { type: 'string' }, nullable: true },
                warnings: { type: 'array', items: { type: 'string' }, nullable: true },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const deviceHealths = await deviceHealthService.getAllDeviceHealth();
        return reply.send(deviceHealths);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Get device health by device ID
  fastify.get(
    '/:deviceId',
    {
      schema: {
        description: 'Get device health by device ID',
        tags: ['Device Health'],
        params: {
          type: 'object',
          properties: {
            deviceId: { type: 'string' },
          },
          required: ['deviceId'],
        },
        response: {
          200: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                deviceId: { type: 'string' },
                status: { type: 'string' },
                lastSeen: { type: 'string', format: 'date-time' },
                batteryLevel: { type: 'number', nullable: true },
                signalStrength: { type: 'number', nullable: true },
                temperature: { type: 'number', nullable: true },
                errors: { type: 'array', items: { type: 'string' }, nullable: true },
                warnings: { type: 'array', items: { type: 'string' }, nullable: true },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
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
        const { deviceId } = request.params as { deviceId: string };
        const deviceHealth = await deviceHealthService.getDeviceHealth(deviceId);
        
        if (!deviceHealth) {
          return reply.status(404).send({ error: 'Device health not found' });
        }

        return reply.send(deviceHealth);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Create or update device health
  fastify.post(
    '/',
    {
      schema: {
        description: 'Create or update device health',
        tags: ['Device Health'],
        body: {
            type: 'object',
            properties: {
              deviceId: { type: 'string' },
              status: { type: 'string' },
              lastSeen: { type: 'string', format: 'date-time' },
              batteryLevel: { type: 'number', nullable: true },
              signalStrength: { type: 'number', nullable: true },
              temperature: { type: 'number', nullable: true },
              errors: { type: 'array', items: { type: 'string' }, nullable: true },
              warnings: { type: 'array', items: { type: 'string' }, nullable: true },
            },
            required: ['deviceId', 'status', 'lastSeen'],
          },
        response: {
          200: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                deviceId: { type: 'string' },
                status: { type: 'string' },
                lastSeen: { type: 'string', format: 'date-time' },
                batteryLevel: { type: 'number', nullable: true },
                signalStrength: { type: 'number', nullable: true },
                temperature: { type: 'number', nullable: true },
                errors: { type: 'array', items: { type: 'string' }, nullable: true },
                warnings: { type: 'array', items: { type: 'string' }, nullable: true },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
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
        const deviceHealth = await deviceHealthService.createOrUpdateDeviceHealth(request.body as any);
        return reply.send(deviceHealth);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Create or update many device health (batch)
  fastify.post(
    '/batch',
    {
      schema: {
        description: 'Create or update multiple device health records',
        tags: ['Device Health'],
        body: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              deviceId: { type: 'string' },
              status: { type: 'string' },
              lastSeen: { type: 'string', format: 'date-time' },
              batteryLevel: { type: 'number', nullable: true },
              signalStrength: { type: 'number', nullable: true },
              temperature: { type: 'number', nullable: true },
              errors: { type: 'array', items: { type: 'string' }, nullable: true },
              warnings: { type: 'array', items: { type: 'string' }, nullable: true },
            },
            required: ['deviceId', 'status', 'lastSeen'],
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              upserted: { type: 'number' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await deviceHealthService.createMany(request.body as any[]);
        return reply.status(201).send(result);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Update device health
  fastify.put(
    '/:deviceId',
    {
      schema: {
        description: 'Update device health',
        tags: ['Device Health'],
        params: {
          type: 'object',
          properties: {
            deviceId: { type: 'string' },
          },
          required: ['deviceId'],
        },
        body: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              lastSeen: { type: 'string', format: 'date-time' },
              batteryLevel: { type: 'number', nullable: true },
              signalStrength: { type: 'number', nullable: true },
              temperature: { type: 'number', nullable: true },
              errors: { type: 'array', items: { type: 'string' }, nullable: true },
              warnings: { type: 'array', items: { type: 'string' }, nullable: true },
            },
          },
        response: {
          200: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                deviceId: { type: 'string' },
                status: { type: 'string' },
                lastSeen: { type: 'string', format: 'date-time' },
                batteryLevel: { type: 'number', nullable: true },
                signalStrength: { type: 'number', nullable: true },
                temperature: { type: 'number', nullable: true },
                errors: { type: 'array', items: { type: 'string' }, nullable: true },
                warnings: { type: 'array', items: { type: 'string' }, nullable: true },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
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
        const { deviceId } = request.params as { deviceId: string };
        const deviceHealth = await deviceHealthService.updateDeviceHealth(deviceId, request.body as any);
        return reply.send(deviceHealth);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Get offline devices
  fastify.get(
    '/offline',
    {
      schema: {
        description: 'Get offline devices',
        tags: ['Device Health'],
        querystring: {
          type: 'object',
          properties: {
            thresholdMinutes: { type: 'number', default: 30 },
          },
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                deviceId: { type: 'string' },
                status: { type: 'string' },
                lastSeen: { type: 'string', format: 'date-time' },
                batteryLevel: { type: 'number', nullable: true },
                signalStrength: { type: 'number', nullable: true },
                temperature: { type: 'number', nullable: true },
                errors: { type: 'array', items: { type: 'string' }, nullable: true },
                warnings: { type: 'array', items: { type: 'string' }, nullable: true },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { thresholdMinutes = 30 } = request.query as { thresholdMinutes?: number };
        const offlineDevices = await deviceHealthService.getOfflineDevices(thresholdMinutes);
        return reply.send(offlineDevices);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Get devices with errors
  fastify.get(
    '/errors',
    {
      schema: {
        description: 'Get devices with errors',
        tags: ['Device Health'],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                deviceId: { type: 'string' },
                status: { type: 'string' },
                lastSeen: { type: 'string', format: 'date-time' },
                batteryLevel: { type: 'number', nullable: true },
                signalStrength: { type: 'number', nullable: true },
                temperature: { type: 'number', nullable: true },
                errors: { type: 'array', items: { type: 'string' }, nullable: true },
                warnings: { type: 'array', items: { type: 'string' }, nullable: true },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const devicesWithErrors = await deviceHealthService.getDevicesWithErrors();
        return reply.send(devicesWithErrors);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Get the latest timestamp for a device's health
  fastify.get(
    '/latest-timestamp/:deviceId',
    {
      schema: {
        description: "Get the latest timestamp for a device's health",
        tags: ['Device Health'],
        params: {
          type: 'object',
          properties: {
            deviceId: { type: 'string' },
          },
          required: ['deviceId'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              last_ts: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { deviceId } = request.params as { deviceId: string };
        const result = await deviceHealthService.getLatestTimestamp(deviceId);
        return reply.send(result);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );
}

