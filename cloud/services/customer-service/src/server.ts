// src/server.ts

import 'reflect-metadata';
import express, { Application, Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';

import { PORT } from './configs/config';
import { AppDataSource } from './utils/dataSource';
import apiRouter from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { openApiDoc } from './utils/openapi';
import { PlanCatalogService } from './services/plan_catalog.service';

async function start() {
  await AppDataSource.initialize();
  console.log('✅ DataSource initialized');

  const app: Application = express();
  app.set('trust proxy', true);

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true, exposedHeaders: ['X-Request-Id'] }));

  // บางชุด @types จะงอแงเรื่องชนิด -> cast เป็น RequestHandler
  const compressionMw: RequestHandler = compression() as unknown as RequestHandler;
  app.use(compressionMw);

  app.use(express.json({ limit: '2mb' }));
  app.use(morgan('combined'));

  app.get('/health', (_req: Request, res: Response) => res.sendStatus(200));
  app.get('/ready', (_req: Request, res: Response) =>
    AppDataSource.isInitialized ? res.sendStatus(200) : res.sendStatus(503)
  );

  // Swagger (Zod → OpenAPI) — cast handlers เพื่อเลี่ยง type mismatch หลายเวอร์ชัน
  const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;
  const doc = { ...openApiDoc, servers: [{ url: baseUrl }] };
  const serveHandlers = swaggerUi.serve as unknown as RequestHandler[];
  const setupHandler = swaggerUi.setup(doc, { explorer: true }) as unknown as RequestHandler;
  app.use('/api-docs', ...serveHandlers, setupHandler);

  app.use('/api', apiRouter);

  app.use(errorHandler);

  const server = app.listen(PORT, () => {
    console.log(`🚀 customer-service listening on ${baseUrl}`);
    console.log(`📖 OpenAPI docs: ${baseUrl}/api-docs`);
  });

  if (process.env.SEED_PLANS === 'true') {
    try {
      await new PlanCatalogService().seedDefaults();
      console.log('🌱 plan_catalog seeded');
    } catch (e) {
      console.warn('⚠️  plan_catalog seed failed:', e);
    }
  }

  const shutdown = (sig: string) => {
    console.log(`⚡ Shutting down on ${sig}...`);
    server.close(async () => {
      try {
        await AppDataSource.destroy();
        console.log('✅ DataSource destroyed');
      } finally {
        process.exit(0);
      }
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
  console.error('❌ Server bootstrap failed:', err);
  process.exit(1);
});



