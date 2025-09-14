import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { ZoneService, CreateZoneData, UpdateZoneData } from '../services/zone.service';

const zoneService = new ZoneService();

export default async function zoneRoutes(fastify: FastifyInstance) {
  // Get all zones
  fastify.get('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get all zones',
      tags: ['zones'],
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
                  geometry: { type: 'object' },
                  type: { type: 'string' },
                  capacity: { type: 'number' },
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
      const zones = await zoneService.getAllZones();
      return reply.send({ success: true, data: zones });
    } catch (error) {
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Get zone by ID
  fastify.get<{ Params: { id: string } }>('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get zone by ID',
      tags: ['zones'],
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
      const zone = await zoneService.getZoneById(request.params.id);
      if (!zone) {
        return reply.status(404).send({ success: false, error: 'Zone not found' });
      }
      return reply.send({ success: true, data: zone });
    } catch (error) {
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Get zones by tenant ID
  fastify.get<{ Params: { tenantId: string } }>('/tenant/:tenantId', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get zones by tenant ID',
      tags: ['zones'],
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
      const zones = await zoneService.getZonesByTenantId(request.params.tenantId);
      return reply.send({ success: true, data: zones });
    } catch (error) {
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Get zones by farm ID
  fastify.get<{ Params: { farmId: string } }>('/farm/:farmId', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get zones by farm ID',
      tags: ['zones'],
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
      const zones = await zoneService.getZonesByFarmId(request.params.farmId);
      return reply.send({ success: true, data: zones });
    } catch (error) {
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Create zone
  fastify.post<{ Body: CreateZoneData }>('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Create a new zone',
      tags: ['zones'],
      security: [{ apiKey: [] }],
      body: {
        type: 'object',
        properties: {
          tenantId: { type: 'string' },
          farmId: { type: 'string' },
          houseId: { type: 'string' },
          name: { type: 'string' },
          geometry: { type: 'object' },
          type: { type: 'string' },
          capacity: { type: 'number' },
          meta: { type: 'object' }
        },
        required: ['tenantId', 'farmId', 'name']
      }
    }
  }, async (request, reply) => {
    try {
      const zone = await zoneService.createZone(request.body);
      return reply.status(201).send({ success: true, data: zone });
    } catch (error) {
      return reply.status(400).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Update zone
  fastify.put<{ Params: { id: string }, Body: UpdateZoneData }>('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Update zone',
      tags: ['zones'],
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
          geometry: { type: 'object' },
          type: { type: 'string' },
          capacity: { type: 'number' },
          meta: { type: 'object' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const zone = await zoneService.updateZone(request.params.id, request.body);
      return reply.send({ success: true, data: zone });
    } catch (error) {
      return reply.status(400).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Delete zone
  fastify.delete<{ Params: { id: string } }>('/:id', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Delete zone',
      tags: ['zones'],
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
      const result = await zoneService.deleteZone(request.params.id);
      return reply.send(result);
    } catch (error) {
      return reply.status(400).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Clear all zones
  fastify.delete('/clear', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Clear all zones',
      tags: ['zones'],
      security: [{ apiKey: [] }]
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await zoneService.clearAllZones();
      return reply.send(result);
    } catch (error) {
      return reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
}


