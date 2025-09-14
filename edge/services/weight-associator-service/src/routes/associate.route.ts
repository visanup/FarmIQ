// Fastify route definitions
import { FastifyInstance } from 'fastify';
import { apiKey } from '../middleware/apiKey';

export default async function associate(fastify: FastifyInstance) {
  fastify.get('/associations/ping', { preHandler: [apiKey] }, async () => {
    return { ok: true };
  });
}

