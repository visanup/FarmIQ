import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { apiKeyAuth } from '../middleware/apiKeyAuth';

export default async function referenceDataRoutes(fastify: FastifyInstance) {
  // Placeholder for reference data routes
  fastify.get('/', {
    preHandler: [apiKeyAuth],
    schema: {
      description: 'Get all reference data',
      tags: ['reference-data'],
      security: [{ apiKey: [] }]
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({ success: true, message: 'Reference data routes coming soon' });
  });
}
