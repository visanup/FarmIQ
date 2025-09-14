import { FastifyInstance } from 'fastify';
import alertsRoutes from './alerts.route';
import alertRulesRoutes from './alertRules.route';
import deviceHealthLogsRoutes from './deviceHealthLogs.route';

export default async function routes(fastify: FastifyInstance) {
  // Register all routes
  fastify.register(alertsRoutes, { prefix: '/alerts' });
  fastify.register(alertRulesRoutes, { prefix: '/alert-rules' });
  fastify.register(deviceHealthLogsRoutes, { prefix: '/device-health-logs' });

  // Health check endpoint
  fastify.get('/health', {
    schema: {
      description: 'Health check endpoint',
      tags: ['health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            service: { type: 'string' }
          }
        }
      }
    }
  }, async (_, reply) => {
    return reply.send({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Monitoring Service'
    });
  });
}