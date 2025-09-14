import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { StationService, CreateStationData, UpdateStationData } from '../services/station.service';

const stationService = new StationService();

export default async function stationRoutes(fastify: FastifyInstance) {
  // Get all stations
  fastify.get('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get all stations',
      tags: ['stations'],
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
                  tenantId: { type: 'string' },
                  farmId: { type: 'string' },
                  houseId: { type: 'string' },
                  name: { type: 'string' },
                  location: { type: 'object' },
                  type: { type: 'string' },
                  status: { type: 'string' },
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
      const stations = await stationService.getAllStations();
      return reply.send({ success: true, data: stations });
    } catch (error) {
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Get station by ID
  fastify.get<{ Params: { id: string } }>('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get station by ID',
      tags: ['stations'],
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
      const station = await stationService.getStationById(request.params.id);
      if (!station) {
        return reply.status(404).send({ success: false, error: 'Station not found' });
      }
      return reply.send({ success: true, data: station });
    } catch (error) {
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Get stations by tenant ID
  fastify.get<{ Params: { tenantId: string } }>('/tenant/:tenantId', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get stations by tenant ID',
      tags: ['stations'],
      security: [{ apiKey: [] }],
      params: {
        type: 'object',
        properties: {
          tenantId: { type: 'string' }
        },
        required: ['tenantId']
      }
    }
  }, async (request, reply) => {
    try {
      const stations = await stationService.getStationsByTenantId(request.params.tenantId);
      return reply.send({ success: true, data: stations });
    } catch (error) {
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Get stations by farm ID
  fastify.get<{ Params: { farmId: string } }>('/farm/:farmId', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get stations by farm ID',
      tags: ['stations'],
      security: [{ apiKey: [] }],
      params: {
        type: 'object',
        properties: {
          farmId: { type: 'string' }
        },
        required: ['farmId']
      }
    }
  }, async (request, reply) => {
    try {
      const stations = await stationService.getStationsByFarmId(request.params.farmId);
      return reply.send({ success: true, data: stations });
    } catch (error) {
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Create station
  fastify.post<{ Body: CreateStationData }>('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Create a new station',
      tags: ['stations'],
      security: [{ apiKey: [] }],
      body: {
        type: 'object',
        properties: {
          tenantId: { type: 'string' },
          farmId: { type: 'string' },
          houseId: { type: 'string' },
          name: { type: 'string' },
          location: { type: 'object' },
          type: { type: 'string' },
          status: { type: 'string' },
          meta: { type: 'object' }
        },
        required: ['tenantId', 'farmId', 'name']
      }
    }
  }, async (request, reply) => {
    try {
      const station = await stationService.createStation(request.body);
      return reply.status(201).send({ success: true, data: station });
    } catch (error) {
      return reply.status(400).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Update station
  fastify.put<{ Params: { id: string }, Body: UpdateStationData }>('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Update station',
      tags: ['stations'],
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
          location: { type: 'object' },
          type: { type: 'string' },
          status: { type: 'string' },
          meta: { type: 'object' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const station = await stationService.updateStation(request.params.id, request.body);
      return reply.send({ success: true, data: station });
    } catch (error) {
      return reply.status(400).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Delete station
  fastify.delete<{ Params: { id: string } }>('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Delete station',
      tags: ['stations'],
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
      const result = await stationService.deleteStation(request.params.id);
      return reply.send(result);
    } catch (error) {
      return reply.status(400).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Clear all stations
  fastify.delete('/clear', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Clear all stations',
      tags: ['stations'],
      security: [{ apiKey: [] }]
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await stationService.clearAllStations();
      return reply.send(result);
    } catch (error) {
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
}


