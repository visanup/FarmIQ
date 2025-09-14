// Fastify routes aggregator
import { FastifyInstance } from 'fastify';
import associate from './associate.route';
import associations from './associations.route';

export default async function routes(fastify: FastifyInstance) {
  await fastify.register(associate);
  await fastify.register(associations);
}



