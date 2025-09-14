// src/server.ts (Fastify)
import 'reflect-metadata';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import routes from './routes';
import { PORT } from './configs/config';
import { ensureBuckets } from './utils/minio';
import { initMqtt } from './utils/mqtt';
import { buildOpenApiSpec } from './utils/swagger';

async function start() {
  try {
    const mqttClient = initMqtt();
    await ensureBuckets();

    const app = Fastify({ logger: false });
    await app.register(cors, { origin: true });
    await app.register(helmet, { contentSecurityPolicy: false, crossOriginEmbedderPolicy: false });

    await app.register(swagger, {
      openapi: buildOpenApiSpec(),
    } as any);
    await app.register(swaggerUi, { routePrefix: '/api-docs' });

    await app.register(async (f) => routes(f), { prefix: '/api' });

    app.get('/health', async () => ({ ok: true }));

    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 image-ingestion-service on http://localhost:${PORT}`);
    console.log(`📖 Swagger UI at        http://localhost:${PORT}/api-docs`);

    const shutdown = async () => {
      try { await app.close(); } finally { mqttClient?.end(true); process.exit(0); }
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (e) {
    console.error('❌ Failed to start server:', e);
    process.exit(1);
  }
}

start();
