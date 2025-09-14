import { FastifyInstance } from 'fastify';
import alertService from '../services/alert.service';
import { authenticate } from '../utils/jwt';

// Define types for request parameters and body
interface AlertParams {
  tenantId: string;
  alertId: string;
}

interface AlertQuery {
  status?: string;
}

interface CreateAlertBody {
  tenant_id: string;
  alert_id: string;
  alert_type: string;
  severity: string;
  status?: string;
  description?: string;
  farm_id?: string;
  house_id?: string;
  device_id?: string;
  batch_id?: string;
  resolved_at?: string;
}

interface UpdateAlertBody {
  alert_type?: string;
  severity?: string;
  status?: string;
  description?: string;
  farm_id?: string;
  house_id?: string;
  device_id?: string;
  batch_id?: string;
  resolved_at?: string;
}

export default async function alertsRoutes(fastify: FastifyInstance) {
  // Add authentication hook for all routes in this plugin
  fastify.addHook('preHandler', authenticate);

  // Create a new alert
  fastify.post<{ Body: CreateAlertBody }>('/', {
    schema: {
      description: 'Create a new alert',
      tags: ['alerts'],
      body: {
        type: 'object',
        required: ['tenant_id', 'alert_id', 'alert_type', 'severity'],
        properties: {
          tenant_id: { type: 'string' },
          alert_id: { type: 'string' },
          alert_type: { type: 'string' },
          severity: { type: 'string' },
          status: { type: 'string' },
          description: { type: 'string' },
          farm_id: { type: 'string' },
          house_id: { type: 'string' },
          device_id: { type: 'string' },
          batch_id: { type: 'string' },
          resolved_at: { type: 'string' }
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
      const alert = await alertService.createAlert(request.body);
      return reply.status(201).send(alert);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to create alert' });
    }
  });

  // Get all alerts for a tenant
  fastify.get<{ Params: { tenantId: string }, Querystring: AlertQuery }>('/:tenantId', {
    schema: {
      description: 'Get all alerts for a tenant',
      tags: ['alerts'],
      params: {
        type: 'object',
        properties: {
          tenantId: { type: 'string' }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string' }
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
      const { status } = request.query;
      
      let alerts;
      if (status) {
        alerts = await alertService.getAlertsByStatus(tenantId, status);
      } else {
        alerts = await alertService.getAlerts(tenantId);
      }
      
      return reply.send(alerts);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch alerts' });
    }
  });

  // Get alert by ID
  fastify.get<{ Params: AlertParams }>('/:tenantId/:alertId', {
    schema: {
      description: 'Get alert by ID',
      tags: ['alerts'],
      params: {
        type: 'object',
        properties: {
          tenantId: { type: 'string' },
          alertId: { type: 'string' }
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
      const { tenantId, alertId } = request.params;
      const alert = await alertService.getAlertById(tenantId, alertId);
      
      if (!alert) {
        return reply.status(404).send({ error: 'Alert not found' });
      }
      
      return reply.send(alert);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch alert' });
    }
  });

  // Update alert
  fastify.put<{ Params: AlertParams, Body: UpdateAlertBody }>('/:tenantId/:alertId', {
    schema: {
      description: 'Update alert',
      tags: ['alerts'],
      params: {
        type: 'object',
        properties: {
          tenantId: { type: 'string' },
          alertId: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          alert_type: { type: 'string' },
          severity: { type: 'string' },
          status: { type: 'string' },
          description: { type: 'string' },
          farm_id: { type: 'string' },
          house_id: { type: 'string' },
          device_id: { type: 'string' },
          batch_id: { type: 'string' },
          resolved_at: { type: 'string' }
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
      const { tenantId, alertId } = request.params;
      const alert = await alertService.updateAlert(tenantId, alertId, request.body);
      return reply.send(alert);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to update alert' });
    }
  });

  // Delete alert
  fastify.delete<{ Params: AlertParams }>('/:tenantId/:alertId', {
    schema: {
      description: 'Delete alert',
      tags: ['alerts'],
      params: {
        type: 'object',
        properties: {
          tenantId: { type: 'string' },
          alertId: { type: 'string' }
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
      const { tenantId, alertId } = request.params;
      await alertService.deleteAlert(tenantId, alertId);
      return reply.status(204).send();
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to delete alert' });
    }
  });
}
