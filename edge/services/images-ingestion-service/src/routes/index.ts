// src/routes/index.ts (Fastify plugin)
import { FastifyInstance } from 'fastify';
import ingestionRoutes from './ingestion.routes';

export default async function routes(fastify: FastifyInstance) {
  await fastify.register(ingestionRoutes, { prefix: '/ingest' });
}
