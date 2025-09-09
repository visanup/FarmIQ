// src/server.ts (Fastify + Prisma migration)
import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import client from 'prom-client';
import { env, port as cfgPort } from './configs/config';
import { logger } from './utils/logger';
import { runConsumers } from './consumers';
import { every } from './utils/scheduler';
import { publishFinalizedMinuteFeatures } from './services/featurePublisher';
import { redis } from './stores/redis';
import { consumer } from './utils/kafka';
import { prisma } from './lib/prisma';
import { Prisma } from '@prisma/client';

let isReady = false;

const fastify = Fastify({ logger: false });
const reg = new client.Registry();
client.collectDefaultMetrics({ register: reg });

fastify.get('/health', async (_req: FastifyRequest, reply: FastifyReply) => {
  try {
    // Test database connection
    await prisma.$queryRaw(Prisma.sql`SELECT 1`);
    await redis.ping();
    return reply.send({ 
      ok: true, 
      service: 'analytics-stream',
      database: 'connected',
      redis: 'connected'
    });
  } catch (err) {
    return reply.code(500).send({ 
      ok: false, 
      service: 'analytics-stream',
      error: String(err) 
    });
  }
});

fastify.get('/ready', async (_req: FastifyRequest, reply: FastifyReply) => {
  if (isReady) return reply.send({ ok: true });
  return reply.code(503).send({ ok: false });
});

fastify.get('/metrics', async (_req: FastifyRequest, reply: FastifyReply) => {
  reply.header('Content-Type', reg.contentType);
  reply.send(await reg.metrics());
});

async function start() {
  try {
    // Start Kafka consumers first
    await runConsumers();
    isReady = true;

    // Background jobs
    every(10_000, publishFinalizedMinuteFeatures);

    const port = Number(cfgPort ?? env.ANALYTIC_STREAM_PORT) || 7303;
    await fastify.listen({ host: '0.0.0.0', port });
    logger.info(`🚀 analytics-stream http://0.0.0.0:${port}`);

    const shutdown = async (signal: NodeJS.Signals) => {
      logger.warn({ signal }, 'graceful-shutdown');
      try { await fastify.close(); } catch {}
      try { await prisma.$disconnect(); } catch {}
      try { await consumer.disconnect(); } catch {}
      try { await redis.quit(); } catch {}
      process.exit(0);
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    logger.error({ err }, 'fatal-startup-error');
    process.exit(1);
  }
}

start();
