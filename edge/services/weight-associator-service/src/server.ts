// src/server.ts (Fastify)
import 'reflect-metadata';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { PORT, IMG_CREATED_RK, WEIGHT_ASSOCIATED_RK } from './configs/config';
import routes from './routes';
import { initMqtt, subscribe, publish } from './utils/mqtt';
import { ImageCreatedEvent } from './schemas/ingestion.schemas';
import { handleImageCreated } from './services/associate.service';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { buildOpenApiSpec } from './utils/swagger';

async function start() {
  const mqtt = initMqtt();

  const app = Fastify({ logger: false });
  await app.register(cors, { origin: true });
  await app.register(helmet, { contentSecurityPolicy: false });

  await app.register(swagger, { openapi: buildOpenApiSpec() } as any);
  await app.register(swaggerUi, { routePrefix: '/api-docs' });
  await app.register(async (f) => routes(f), { prefix: '/api' });
  app.get('/health', async () => ({ ok: true }));

  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`🚀 weight-associator-service on :${PORT}`);

  // MQTT: image.created -> associate -> weight.associated
  subscribe(IMG_CREATED_RK, async (payload) => {
    const ev = ImageCreatedEvent.parse(payload);
    const { media, reading, deltaMs } = await handleImageCreated(ev);
    publish(WEIGHT_ASSOCIATED_RK, {
      event: 'weight.associated',
      media_id: Number(media.mediaId),
      reading_id: Number(reading.id),
      delta_ms: deltaMs,
      weight: reading.value_num ?? null,
      time: new Date().toISOString()
    });
  });

  const shutdown = async () => { try { await app.close(); } finally { process.exit(0); } };
  process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
}
start().catch((e) => { console.error(e); process.exit(1); });
