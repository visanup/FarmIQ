import { FastifyInstance } from 'fastify';
import { DeviceConfigurationService } from '../services/device-configuration.service';

const deviceConfigurationService = new DeviceConfigurationService();

export async function deviceConfigurationRoutes(fastify: FastifyInstance) {
  // Get all device configurations
  fastify.get(
    '/',
    {
      schema: {
        description: 'Get all device configurations',
        tags: ['Device Configurations'],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'string', default: '1' },
            limit: { type: 'string', default: '10' },
            deviceId: { type: 'string' },
            configType: { type: 'string' },
            isActive: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              configurations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    deviceId: { type: 'string' },
                    configType: { type: 'string' },
                    configData: { type: 'object' },
                    version: { type: 'string' },
                    isActive: { type: 'boolean' },
                    appliedAt: { type: 'string', format: 'date-time', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                  },
                },
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
        const { deviceId, configType, isActive, page = 1, limit = 10 } = request.query as any;
        const result = await deviceConfigurationService.getDeviceConfigurations(
          parseInt(page),
          parseInt(limit),
          deviceId,
          configType,
          isActive === 'true' ? true : isActive === 'false' ? false : undefined
        );
        return reply.send(result);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Get device configuration by ID
  fastify.get(
    '/:id',
    {
      schema: {
        description: 'Get device configuration by ID',
        tags: ['Device Configurations'],
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
              id: { type: 'string' },
              deviceId: { type: 'string' },
              configType: { type: 'string' },
              configData: { type: 'object' },
              version: { type: 'string' },
              isActive: { type: 'boolean' },
              appliedAt: { type: 'string', format: 'date-time', nullable: true },
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
        const { id } = request.params as { id: string };
        const config = await deviceConfigurationService.getDeviceConfigurationById(id);
        
        if (!config) {
          return reply.status(404).send({ error: 'Device configuration not found' });
        }

        return reply.send(config);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Create device configuration
  fastify.post(
    '/',
    {
      schema: {
        description: 'Create a new device configuration',
        tags: ['Device Configurations'],
        body: {
          type: 'object',
          properties: {
            deviceId: { type: 'string' },
            configType: { type: 'string' },
            configData: { type: 'object' },
            version: { type: 'string' },
            isActive: { type: 'boolean', default: true },
            appliedAt: { type: 'string', format: 'date-time', nullable: true },
          },
          required: ['deviceId', 'configType', 'configData', 'version'],
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              deviceId: { type: 'string' },
              configType: { type: 'string' },
              configData: { type: 'object' },
              version: { type: 'string' },
              isActive: { type: 'boolean' },
              appliedAt: { type: 'string', format: 'date-time', nullable: true },
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
        const config = await deviceConfigurationService.createDeviceConfiguration(request.body as any);
        return reply.status(201).send(config);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Update device configuration
  fastify.put(
    '/:id',
    {
      schema: {
        description: 'Update a device configuration',
        tags: ['Device Configurations'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            configData: { type: 'object' },
            version: { type: 'string' },
            isActive: { type: 'boolean' },
            appliedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              deviceId: { type: 'string' },
              configType: { type: 'string' },
              configData: { type: 'object' },
              version: { type: 'string' },
              isActive: { type: 'boolean' },
              appliedAt: { type: 'string', format: 'date-time', nullable: true },
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
        const { id } = request.params as { id: string };
        const config = await deviceConfigurationService.updateDeviceConfiguration(id, request.body as any);
        return reply.send(config);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          return reply.status(404).send({ error: error.message });
        }
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Delete device configuration
  fastify.delete(
    '/:id',
    {
      schema: {
        description: 'Delete a device configuration',
        tags: ['Device Configurations'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          204: {
            type: 'null',
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
        await deviceConfigurationService.deleteDeviceConfiguration(id);
        return reply.status(204).send();
      } catch (error: any) {
        if (error.message.includes('not found')) {
          return reply.status(404).send({ error: error.message });
        }
        return reply.status(500).send({ error: error.message });
      }
    }
  );
}
