import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { SensorTypeService, CreateSensorTypeData, UpdateSensorTypeData } from '../services/sensorType.service';

const sensorTypeService = new SensorTypeService();

export default async function sensorTypeRoutes(fastify: FastifyInstance) {
  // Get all sensor types
  fastify.get('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get all sensor types',
      tags: ['sensor-types'],
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
                  unit: { type: 'string' },
                  dataType: { type: 'string' },
                  range: { type: 'object' },
                  description: { type: 'string' },
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
      const sensorTypes = await sensorTypeService.getAllSensorTypes();
      return reply.send({ success: true, data: sensorTypes });
    } catch (error) {
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Get sensor type by ID
  fastify.get<{ Params: { id: string } }>('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get sensor type by ID',
      tags: ['sensor-types'],
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
      const sensorType = await sensorTypeService.getSensorTypeById(request.params.id);
      if (!sensorType) {
        return reply.status(404).send({ success: false, error: 'Sensor type not found' });
      }
      return reply.send({ success: true, data: sensorType });
    } catch (error) {
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Create sensor type
  fastify.post<{ Body: CreateSensorTypeData }>('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Create a new sensor type',
      tags: ['sensor-types'],
      security: [{ apiKey: [] }],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          unit: { type: 'string' },
          dataType: { type: 'string' },
          range: { type: 'object' },
          description: { type: 'string' },
          meta: { type: 'object' }
        },
        required: ['name']
      }
    }
  }, async (request, reply) => {
    try {
      const sensorType = await sensorTypeService.createSensorType(request.body);
      return reply.status(201).send({ success: true, data: sensorType });
    } catch (error) {
      return reply.status(400).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Update sensor type
  fastify.put<{ Params: { id: string }, Body: UpdateSensorTypeData }>('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Update sensor type',
      tags: ['sensor-types'],
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
          unit: { type: 'string' },
          dataType: { type: 'string' },
          range: { type: 'object' },
          description: { type: 'string' },
          meta: { type: 'object' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const sensorType = await sensorTypeService.updateSensorType(request.params.id, request.body);
      return reply.send({ success: true, data: sensorType });
    } catch (error) {
      return reply.status(400).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Delete sensor type
  fastify.delete<{ Params: { id: string } }>('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Delete sensor type',
      tags: ['sensor-types'],
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
      const result = await sensorTypeService.deleteSensorType(request.params.id);
      return reply.send(result);
    } catch (error) {
      return reply.status(400).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Clear all sensor types
  fastify.delete('/clear', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Clear all sensor types',
      tags: ['sensor-types'],
      security: [{ apiKey: [] }]
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await sensorTypeService.clearAllSensorTypes();
      return reply.send(result);
    } catch (error) {
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
}


