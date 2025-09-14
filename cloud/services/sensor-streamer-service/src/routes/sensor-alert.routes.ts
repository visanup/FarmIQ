import { FastifyInstance } from 'fastify';
import { SensorAlertService } from '../services/sensor-alert.service';

const sensorAlertService = new SensorAlertService();

export async function sensorAlertRoutes(fastify: FastifyInstance) {
  // Get all sensor alerts
  fastify.get(
    '/',
    {
      schema: {
        description: 'Get all sensor alerts',
        tags: ['Sensor Alerts'],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'string', default: '1' },
            limit: { type: 'string', default: '10' },
            deviceId: { type: 'string' },
            alertType: { type: 'string' },
            severity: { type: 'string' },
            isResolved: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              alerts: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    deviceId: { type: 'string' },
                    farmId: { type: 'string', nullable: true },
                    houseId: { type: 'string', nullable: true },
                    alertType: { type: 'string' },
                    severity: { type: 'string' },
                    message: { type: 'string' },
                    value: { type: 'number' },
                    threshold: { type: 'number' },
                    isResolved: { type: 'boolean' },
                    resolvedAt: { type: 'string', format: 'date-time', nullable: true },
                    metadata: { type: 'object', nullable: true },
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
        const { deviceId, alertType, severity, isResolved, page = 1, limit = 10 } = request.query as any;
        const result = await sensorAlertService.getSensorAlerts(
          parseInt(page),
          parseInt(limit),
          deviceId,
          alertType,
          severity,
          isResolved === 'true' ? true : isResolved === 'false' ? false : undefined
        );
        return reply.send(result);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Get sensor alert by ID
  fastify.get(
    '/:id',
    {
      schema: {
        description: 'Get sensor alert by ID',
        tags: ['Sensor Alerts'],
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
              farmId: { type: 'string', nullable: true },
              houseId: { type: 'string', nullable: true },
              alertType: { type: 'string' },
              severity: { type: 'string' },
              message: { type: 'string' },
              value: { type: 'number' },
              threshold: { type: 'number' },
              isResolved: { type: 'boolean' },
              resolvedAt: { type: 'string', format: 'date-time', nullable: true },
              metadata: { type: 'object', nullable: true },
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
        const alert = await sensorAlertService.getSensorAlertById(id);
        
        if (!alert) {
          return reply.status(404).send({ error: 'Sensor alert not found' });
        }

        return reply.send(alert);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Create sensor alert
  fastify.post(
    '/',
    {
      schema: {
        description: 'Create a new sensor alert',
        tags: ['Sensor Alerts'],
        body: {
          type: 'object',
          properties: {
            deviceId: { type: 'string' },
            farmId: { type: 'string', nullable: true },
            houseId: { type: 'string', nullable: true },
            alertType: { type: 'string' },
            severity: { type: 'string' },
            message: { type: 'string' },
            value: { type: 'number' },
            threshold: { type: 'number' },
            isResolved: { type: 'boolean', default: false },
            resolvedAt: { type: 'string', format: 'date-time', nullable: true },
            metadata: { type: 'object', nullable: true },
          },
          required: ['deviceId', 'alertType', 'severity', 'message', 'value', 'threshold'],
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              deviceId: { type: 'string' },
              farmId: { type: 'string', nullable: true },
              houseId: { type: 'string', nullable: true },
              alertType: { type: 'string' },
              severity: { type: 'string' },
              message: { type: 'string' },
              value: { type: 'number' },
              threshold: { type: 'number' },
              isResolved: { type: 'boolean' },
              resolvedAt: { type: 'string', format: 'date-time', nullable: true },
              metadata: { type: 'object', nullable: true },
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
        const alert = await sensorAlertService.createSensorAlert(request.body as any);
        return reply.status(201).send(alert);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Update sensor alert
  fastify.put(
    '/:id',
    {
      schema: {
        description: 'Update a sensor alert',
        tags: ['Sensor Alerts'],
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
            isResolved: { type: 'boolean' },
            resolvedAt: { type: 'string', format: 'date-time', nullable: true },
            message: { type: 'string' },
            metadata: { type: 'object', nullable: true },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              deviceId: { type: 'string' },
              farmId: { type: 'string', nullable: true },
              houseId: { type: 'string', nullable: true },
              alertType: { type: 'string' },
              severity: { type: 'string' },
              message: { type: 'string' },
              value: { type: 'number' },
              threshold: { type: 'number' },
              isResolved: { type: 'boolean' },
              resolvedAt: { type: 'string', format: 'date-time', nullable: true },
              metadata: { type: 'object', nullable: true },
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
        const alert = await sensorAlertService.updateSensorAlert(id, request.body as any);
        return reply.send(alert);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          return reply.status(404).send({ error: error.message });
        }
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Delete sensor alert
  fastify.delete(
    '/:id',
    {
      schema: {
        description: 'Delete a sensor alert',
        tags: ['Sensor Alerts'],
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
        await sensorAlertService.deleteSensorAlert(id);
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
