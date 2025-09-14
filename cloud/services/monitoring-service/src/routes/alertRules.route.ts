import { FastifyInstance } from 'fastify';
import alertRuleService from '../services/alertRule.service';
import { authenticate } from '../utils/jwt';

// Define types for request parameters and body
interface AlertRuleParams {
  tenantId: string;
  ruleId: string;
}

interface AlertRuleQuery {
  metricName?: string;
}

interface CreateAlertRuleBody {
  tenant_id: string;
  rule_id: string;
  metric_name: string;
  threshold: number;
  condition: string;
  scope?: object;
}

interface UpdateAlertRuleBody {
  metric_name?: string;
  threshold?: number;
  condition?: string;
  scope?: object;
}

export default async function alertRulesRoutes(fastify: FastifyInstance) {
  // Add authentication hook for all routes in this plugin
  fastify.addHook('preHandler', authenticate);

  // Create a new alert rule
  fastify.post<{ Body: CreateAlertRuleBody }>('/', {
    schema: {
      description: 'Create a new alert rule',
      tags: ['alert-rules'],
      body: {
        type: 'object',
        required: ['tenant_id', 'rule_id', 'metric_name', 'threshold', 'condition'],
        properties: {
          tenant_id: { type: 'string' },
          rule_id: { type: 'string' },
          metric_name: { type: 'string' },
          threshold: { type: 'number' },
          condition: { type: 'string' },
          scope: { type: 'object' }
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
      const alertRule = await alertRuleService.createAlertRule(request.body);
      return reply.status(201).send(alertRule);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to create alert rule' });
    }
  });

  // Get all alert rules for a tenant
  fastify.get<{ Params: { tenantId: string }, Querystring: AlertRuleQuery }>('/:tenantId', {
    schema: {
      description: 'Get all alert rules for a tenant',
      tags: ['alert-rules'],
      params: {
        type: 'object',
        properties: {
          tenantId: { type: 'string' }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          metricName: { type: 'string' }
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
      const { metricName } = request.query;
      
      let alertRules;
      if (metricName) {
        alertRules = await alertRuleService.getAlertRulesByMetricName(tenantId, metricName);
      } else {
        alertRules = await alertRuleService.getAlertRules(tenantId);
      }
      
      return reply.send(alertRules);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch alert rules' });
    }
  });

  // Get alert rule by ID
  fastify.get<{ Params: AlertRuleParams }>('/:tenantId/:ruleId', {
    schema: {
      description: 'Get alert rule by ID',
      tags: ['alert-rules'],
      params: {
        type: 'object',
        properties: {
          tenantId: { type: 'string' },
          ruleId: { type: 'string' }
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
      const { tenantId, ruleId } = request.params;
      const alertRule = await alertRuleService.getAlertRuleById(tenantId, ruleId);
      
      if (!alertRule) {
        return reply.status(404).send({ error: 'Alert rule not found' });
      }
      
      return reply.send(alertRule);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch alert rule' });
    }
  });

  // Update alert rule
  fastify.put<{ Params: AlertRuleParams, Body: UpdateAlertRuleBody }>('/:tenantId/:ruleId', {
    schema: {
      description: 'Update alert rule',
      tags: ['alert-rules'],
      params: {
        type: 'object',
        properties: {
          tenantId: { type: 'string' },
          ruleId: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          metric_name: { type: 'string' },
          threshold: { type: 'number' },
          condition: { type: 'string' },
          scope: { type: 'object' }
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
      const { tenantId, ruleId } = request.params;
      const alertRule = await alertRuleService.updateAlertRule(tenantId, ruleId, request.body);
      return reply.send(alertRule);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to update alert rule' });
    }
  });

  // Delete alert rule
  fastify.delete<{ Params: AlertRuleParams }>('/:tenantId/:ruleId', {
    schema: {
      description: 'Delete alert rule',
      tags: ['alert-rules'],
      params: {
        type: 'object',
        properties: {
          tenantId: { type: 'string' },
          ruleId: { type: 'string' }
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
      const { tenantId, ruleId } = request.params;
      await alertRuleService.deleteAlertRule(tenantId, ruleId);
      return reply.status(204).send();
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to delete alert rule' });
    }
  });
}