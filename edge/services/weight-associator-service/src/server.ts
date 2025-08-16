// src/server.ts
import 'reflect-metadata';
import express from 'express';
import helmet from 'helmet'; import cors from 'cors'; import morgan from 'morgan';
import { AppDataSource } from './utils/dataSource';
import { PORT, IMG_CREATED_RK, WEIGHT_ASSOCIATED_RK } from './configs/config';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';
import { initMqtt, subscribe, publish } from './utils/mqtt';
import { ImageCreatedEvent } from './schemas/ingestion.schemas';
import { handleImageCreated } from './services/associate.service';

const swaggerUi = require('swagger-ui-express');
import { buildOpenApiSpec } from './utils/swagger';

async function start() {
  await AppDataSource.initialize();
  const mqtt = initMqtt();

  // REST
  const app = express();
  app.use(helmet({ contentSecurityPolicy: false })); app.use(cors()); app.use(morgan('combined')); app.use(express.json());
  app.get('/health', (_req, res) => res.sendStatus(200));
  const spec = buildOpenApiSpec();
  app.get('/openapi.json', (_req, res) => res.type('application/json').send(spec));
  app.use('/api-docs', ...swaggerUi.serve, swaggerUi.setup(undefined, { explorer: true, swaggerUrl: '/openapi.json' }));
  app.use('/api', routes);
  app.use(errorHandler);
  const server = app.listen(PORT, () => console.log(`🚀 weight-associator-service on :${PORT}`));

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

  const shutdown = () => server.close(async () => { try { await AppDataSource.destroy(); } finally { process.exit(0); }});
  process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
}
start().catch((e) => { console.error(e); process.exit(1); });
