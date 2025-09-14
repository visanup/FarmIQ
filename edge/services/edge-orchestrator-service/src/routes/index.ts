// Fastify routes aggregator
import { FastifyInstance } from 'fastify';
import health from './health.route';
import datasets from './datasets.route';
import models from './models.route';
import infer from './infer.route';

export default async function routes(fastify: FastifyInstance) {
  await fastify.register(health, { prefix: '/health' });
  await fastify.register(datasets, { prefix: '/datasets' });
  await fastify.register(models, { prefix: '/models' });
  await fastify.register(infer, { prefix: '/infer' });
}

