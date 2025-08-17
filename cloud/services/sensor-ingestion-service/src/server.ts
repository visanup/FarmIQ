// src/server.ts
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { AppDataSource } from './utils/dataSource';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { PORT } from './configs/config';
import { ensureBuckets } from './utils/minio';
import { initMqtt } from './utils/mqtt';
import { buildOpenApiSpec } from './utils/swagger';
const swaggerUi = require('swagger-ui-express');

async function start() {
  try {
    await AppDataSource.initialize();
    console.log('✅ DataSource initialized');

    initMqtt();
    await ensureBuckets();

    const app = express();
    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
      })
    );
    app.use(cors());
    app.use(morgan('combined'));
    app.use(express.json());

    app.get('/health', (_req, res) => res.sendStatus(200));

    const openApiSpec = buildOpenApiSpec();
    app.get('/openapi.json', (_req, res) => res.type('application/json').send(openApiSpec));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(undefined, { explorer: true, swaggerUrl: '/openapi.json' }));

    app.use('/api', routes);
    app.use(errorHandler);

    const server = app.listen(PORT, () => {
      console.log(`🚀 edge-orchestrator-service on http://localhost:${PORT}`);
      console.log(`📖 Swagger UI http://localhost:${PORT}/api-docs`);
    });

    const shutdown = () => {
      console.log('⚡ Shutting down...');
      server.close(async () => {
        try { await AppDataSource.destroy(); } catch {}
        process.exit(0);
      });
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (e) {
    console.error('❌ Failed to start server:', e);
    process.exit(1);
  }
}

start();

