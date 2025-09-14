import { FastifyInstance } from 'fastify';
import deviceHealthLogService from '../services/deviceHealthLog.service';
import { authenticate } from '../utils/jwt';

// Define types for request parameters and body
interface DeviceHealthLogParams {
  tenantId: string;
  id: string;
}

interface DeviceHealthLogQuery {
  deviceId?: string;
}

interface CreateDeviceHealthLogBody {
  tenant_id: string;
  device_id: string;
  status: string;
  time: string;
  meta?: object;
}

export default async function deviceHealthLogsRoutes(fastify: FastifyInstance) {
  // Add authentication hook for all routes in this plugin
  fastify.addHook('preHandler', authenticate);

  // Create a new device health log
  fastify.post<{ Body: CreateDeviceHealthLogBody }>('/', {
    schema: {
      description: 'Create a new device health log',
      tags: ['device-health-logs'],
      body: {
        type: 'object',
        required: ['tenant_id', 'device_id', 'status', 'time'],
        properties: {
          tenant_id: { type: 'string' },
          device_id: { type: 'string' },
          status: { type: 'string' },
          time: { type: 'string' },
          meta: { type: 'object' }
        }
      },
      response: {
        201: {
          type: 'object'
        }
      }
    }
  }, async (request, reply) => {
    try {
      const deviceHealthLog = await deviceHealthLogService.createDeviceHealthLog(request.body);
      return reply.status(201).send(deviceHealthLog);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to create device health log' });
    }
  });

  // Get all device health logs for a tenant
  fastify.get<{ Params: { tenantId: string }, Querystring: DeviceHealthLogQuery }>('/:tenantId', {
    schema: {
      description: 'Get all device health logs for a tenant',
      tags: ['device-health-logs'],
      params: {
        type: 'object',
        properties: {
          tenantId: { type: 'string' }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          deviceId: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object'
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { tenantId } = request.params;
      const { deviceId } = request.query;
      
      let deviceHealthLogs;
      if (deviceId) {
        deviceHealthLogs = await deviceHealthLogService.getDeviceHealthLogsByDeviceId(tenantId, deviceId);
      } else {
        deviceHealthLogs = await deviceHealthLogService.getDeviceHealthLogs(tenantId);
      }
      
      return reply.send(deviceHealthLogs);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch device health logs' });
    }
  });

  // Get device health log by ID
  fastify.get<{ Params: DeviceHealthLogParams }>('/:tenantId/:id', {
    schema: {
      description: 'Get device health log by ID',
      tags: ['device-health-logs'],
      params: {
        type: 'object',
        properties: {
          tenantId: { type: 'string' },
          id: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object'
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { tenantId, id } = request.params;
      const deviceHealthLog = await deviceHealthLogService.getDeviceHealthLogById(tenantId, BigInt(id));
      
      if (!deviceHealthLog) {
        return reply.status(404).send({ error: 'Device health log not found' });
      }
      
      return reply.send(deviceHealthLog);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch device health log' });
    }
  });

  // Delete device health log
  fastify.delete<{ Params: DeviceHealthLogParams }>('/:tenantId/:id', {
    schema: {
      description: 'Delete device health log',
      tags: ['device-health-logs'],
      params: {
        type: 'object',
        properties: {
          tenantId: { type: 'string' },
          id: { type: 'string' }
        }
      },
      response: {
        204: {
          type: 'null'
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { tenantId, id } = request.params;
      await deviceHealthLogService.deleteDeviceHealthLog(tenantId, BigInt(id));
      return reply.status(204).send();
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to delete device health log' });
    }
  });
}