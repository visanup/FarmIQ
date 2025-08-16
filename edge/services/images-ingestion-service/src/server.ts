// src/server.ts
import 'reflect-metadata';
import express, { Application, Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// ใช้ require เพื่อเลี่ยง type clash ของ express typings
const swaggerUi = require('swagger-ui-express') as {
  serve: RequestHandler[];
  setup: (swaggerDoc?: any, opts?: any) => RequestHandler;
};

import { AppDataSource } from './utils/dataSource';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { PORT } from './configs/config';
import { ensureBuckets } from './utils/minio';
import { initMqtt } from './utils/mqtt';
import { buildOpenApiSpec } from './utils/swagger';

async function start() {
  try {
    // 1) Init infra
    await AppDataSource.initialize();
    console.log('✅ DataSource initialized');

    const mqttClient = initMqtt();
    await ensureBuckets();

    // 2) App & middlewares
    const app: Application = express();
    app.use(
      helmet({
        contentSecurityPolicy: false,       // ให้ Swagger UI โหลดสคริปต์ได้
        crossOriginEmbedderPolicy: false,
      })
    );
    app.use(cors());
    app.use(morgan('combined'));
    app.use(express.json());

    // 3) Health-check
    app.get('/health', (_req: Request, res: Response) => res.sendStatus(200));

    // 4) Swagger (เสิร์ฟสเปคเป็นไฟล์ JSON)
    const openApiSpec = buildOpenApiSpec();
    app.get('/openapi.json', (_req, res) => {
      res.type('application/json').status(200).send(openApiSpec);
    });
    app.use(
      '/api-docs',
      ...swaggerUi.serve,
      swaggerUi.setup(undefined, {
        explorer: true,
        swaggerUrl: '/openapi.json',
      })
    );

    // 5) Routes
    app.use('/api', routes);

    // 6) Error handler
    app.use(errorHandler);

    // 7) Listen
    const server = app.listen(PORT, () => {
      console.log(`🚀 image-ingestion-service on http://localhost:${PORT}`);
      console.log(`📖 Swagger UI at        http://localhost:${PORT}/api-docs`);
    });

    // 8) Graceful shutdown
    const shutdown = () => {
      console.log('⚡ Shutting down...');
      server.close(async () => {
        try {
          await AppDataSource.destroy();
        } catch (e) {
          console.error('Error closing DataSource:', e);
        }
        try {
          mqttClient?.end(true);
        } catch (e) {
          console.error('Error closing MQTT:', e);
        }
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
