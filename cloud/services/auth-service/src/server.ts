// services/auth-service/src/server.ts
import 'reflect-metadata';
import express, { Request, Response, RequestHandler } from 'express';
import cors from 'cors';

// ใช้ require ลด friction เรื่อง types ของ lib UI
const swaggerUiModule = require('swagger-ui-express') as {
  serve: RequestHandler[];
  setup: (swaggerDoc: any, opts?: any) => RequestHandler;
};

import { DataSource } from 'typeorm';
import { createAuthRouter } from './routes/auth.route';
import { User } from './models/user.model';
import { RefreshToken } from './models/refreshToken.model';
import {
  DATABASE_URL,
  PORT,
  CORS_ALLOW_CREDENTIALS,
  CORS_ALLOWED_ORIGINS,
  CORS_ALLOW_HEADERS,
  CORS_ALLOW_METHODS,
} from './configs/config';
import { buildOpenApiDoc } from './utils/openapi';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: DATABASE_URL,
  schema: 'auth',
  entities: [User, RefreshToken],
  synchronize: false, // ใช้ตาม schema ที่คุณเซ็ตผ่าน SQL
  // logging: true, // เปิดถ้าต้องการ debug SQL
});

AppDataSource.initialize()
  .then(() => {
    const app = express();

    // --- CORS จาก ENV ---
    app.use(
      cors({
        credentials: CORS_ALLOW_CREDENTIALS,
        origin: (origin, cb) => {
          if (!origin) return cb(null, true); // อนุญาต non-browser client
          if (
            CORS_ALLOWED_ORIGINS.includes('*') ||
            CORS_ALLOWED_ORIGINS.includes(origin)
          ) {
            return cb(null, true);
          }
          return cb(new Error('Not allowed by CORS'));
        },
        methods: CORS_ALLOW_METHODS === '*' ? undefined : CORS_ALLOW_METHODS,
        allowedHeaders: CORS_ALLOW_HEADERS === '*' ? undefined : CORS_ALLOW_HEADERS,
      })
    );

    app.use(express.json());

    // --- Swagger UI (สเปกมาจาก Zod) ---
    const baseUrl = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
    const openapiDoc = buildOpenApiDoc(baseUrl);

    const serveHandlers = swaggerUiModule.serve;
    const setupHandler = swaggerUiModule.setup(openapiDoc, { explorer: true });

    app.get('/', (_req: Request, res: Response) => res.redirect('/api-docs'));
    app.use('/api-docs', ...serveHandlers, setupHandler);

    // --- Healthcheck ---
    app.get('/health', (_req: Request, res: Response) => {
      res.json({ ok: true, service: 'auth-service', time: new Date().toISOString() });
    });

    // --- Routes ---
    app.use('/api/auth', createAuthRouter(AppDataSource));

    app.listen(PORT, () => {
      console.log(`🛡️  Auth service running on port ${PORT}`);
      console.log(`📖  Swagger UI (Zod): ${baseUrl}/api-docs`);
    });
  })
  .catch((error) => {
    console.error('❌ Error initializing data source', error);
    process.exit(1);
  });

// กันเหตุไม่คาดคิด
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});
