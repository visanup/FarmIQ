import { FastifyInstance } from 'fastify';
import { SensorService } from '../services/sensor.service';

const sensorService = new SensorService();

export async function sensorRoutes(fastify: FastifyInstance) {
  // Get all sensor readings
  fastify.get(
    '/',
    {
      schema: {
        description: 'Get all sensor readings',
        tags: ['Sensor Readings'],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'string', default: '1' },
            limit: { type: 'string', default: '10' },
            search: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            deviceId: { type: 'string' },
            sensorType: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              readings: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    deviceId: { type: 'string' },
                    farmId: { type: 'string', nullable: true },
                    houseId: { type: 'string', nullable: true },
                    sensorType: { type: 'string' },
                    value: { type: 'number' },
                    unit: { type: 'string' },
                    location: { type: 'object', nullable: true },
                    metadata: { type: 'object', nullable: true },
                    timestamp: { type: 'string', format: 'date-time' },
                    createdAt: { type: 'string', format: 'date-time' },
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
        const { deviceId, sensorType, page = 1, limit = 10, startDate, endDate } = request.query as any;
        const result = await sensorService.getSensorReadings(
          parseInt(page), 
          parseInt(limit), 
          deviceId, 
          sensorType, 
          startDate, 
          endDate
        );
        return reply.send(result);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Get sensor reading by ID
  fastify.get(
    '/:id',
    {
      schema: {
        description: 'Get sensor reading by ID',
        tags: ['Sensor Readings'],
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
              sensorType: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
              createdAt: { type: 'string', format: 'date-time' },
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
        const reading = await sensorService.getSensorReadingById(id);
        
        if (!reading) {
          return reply.status(404).send({ error: 'Sensor reading not found' });
        }

        return reply.send(reading);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Create sensor reading
  fastify.post(
    '/',
    {
      schema: {
        description: 'Create a new sensor reading',
        tags: ['Sensor Readings'],
        body: {
          type: 'object',
          properties: {
            deviceId: { type: 'string' },
            farmId: { type: 'string' },
            houseId: { type: 'string' },
            sensorType: { type: 'string' },
            value: { type: 'number' },
            unit: { type: 'string' },
            location: {
              type: 'object',
              properties: {
                x: { type: 'number' },
                y: { type: 'number' },
                z: { type: 'number' },
              },
            },
            metadata: { type: 'object' },
            timestamp: { type: 'string', format: 'date-time' },
          },
          required: ['deviceId', 'sensorType', 'value', 'unit'],
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              deviceId: { type: 'string' },
              farmId: { type: 'string', nullable: true },
              houseId: { type: 'string', nullable: true },
              sensorType: { type: 'string' },
              value: { type: 'number' },
              unit: { type: 'string' },
              location: { type: 'object', nullable: true },
              metadata: { type: 'object', nullable: true },
              timestamp: { type: 'string', format: 'date-time' },
              createdAt: { type: 'string', format: 'date-time' },
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
        const reading = await sensorService.createSensorReading(request.body as any);
        return reply.status(201).send(reading);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Create many sensor readings (batch)
  fastify.post(
    '/batch',
    {
      schema: {
        description: 'Create multiple sensor readings',
        tags: ['Sensor Readings'],
        body: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              deviceId: { type: 'string' },
              farmId: { type: 'string', nullable: true },
              houseId: { type: 'string', nullable: true },
              sensorType: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
            },
            required: ['deviceId', 'sensorType', 'timestamp'],
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              inserted: { type: 'number' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await sensorService.createMany(request.body as any[]);
        return reply.status(201).send(result);
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );

  // Get latest sensor readings for a device
  fastify.get(
    '/device/:deviceId/latest',
    {
      schema: {
        description: 'Get latest sensor readings for a device',
        tags: ['Sensor Readings'],
        params: {
          type: 'object',
          properties: {
            deviceId: { type: 'string' },
          },
          required: ['deviceId'],
        },
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'number', default: 10 },
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
                farmId: { type: 'string', nullable: true },
                houseId: { type: 'string', nullable: true },
                sensorType: { type: 'string' },
                timestamp: { type: 'string', format: 'date-time' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { deviceId } = request.params as { deviceId: string };
        const { limit = 10 } = request.query as { limit?: number };
        const readings = await sensorService.getLatestSensorReadings(deviceId, limit);
        return reply.send(readings);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Get sensor readings by type
  fastify.get(
    '/type/:sensorType',
    {
      schema: {
        description: 'Get sensor readings by type',
        tags: ['Sensor Readings'],
        params: {
          type: 'object',
          properties: {
            sensorType: { type: 'string' },
          },
          required: ['sensorType'],
        },
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'string', default: '1' },
            limit: { type: 'string', default: '10' },
            search: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              readings: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    deviceId: { type: 'string' },
                    farmId: { type: 'string', nullable: true },
                    houseId: { type: 'string', nullable: true },
                    sensorType: { type: 'string' },
                    value: { type: 'number' },
                    unit: { type: 'string' },
                    location: { type: 'object', nullable: true },
                    metadata: { type: 'object', nullable: true },
                    timestamp: { type: 'string', format: 'date-time' },
                    createdAt: { type: 'string', format: 'date-time' },
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
        const { sensorType } = request.params as { sensorType: string };
        const pagination = request.query as any;
        const result = await sensorService.getSensorReadingsByType(sensorType, pagination);
        return reply.send(result);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // Get the latest timestamp for sensor readings
  fastify.get(
    '/latest-timestamp',
    {
      schema: {
        description: 'Get the latest timestamp for sensor readings',
        tags: ['Sensor Readings'],
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
        const result = await sensorService.getLatestTimestamp();
        return reply.send(result);
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );
}

