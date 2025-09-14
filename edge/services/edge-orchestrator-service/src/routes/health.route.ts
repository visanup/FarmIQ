import { FastifyInstance } from 'fastify';
export default async function health(fastify: FastifyInstance) {
  fastify.get('/', async () => ({ ok: true, service: 'edge-orchestrator-service' }));
}
