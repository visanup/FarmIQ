// services/data-service/src/server.ts

import 'reflect-metadata';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { AppDataSource } from './utils/dataSource';
import routes from './routes';
import { authenticateToken } from './middlewares/auth';
import { errorHandler } from './middlewares/errorHandler';
import { PORT } from './configs/config';

async function startServer() {
  try {
    // 1) Initialize DB connection
    await AppDataSource.initialize();
    console.log('✅ DataSource has been initialized');

    const app: Application = express();

    // 2) Security & logging middleware
    app.use(helmet());
    app.use(cors());
    app.use(morgan('combined'));
    app.use(express.json());

    // 3) Health-check endpoint
    app.get('/health', (_req: Request, res: Response) => {
      res.sendStatus(200);
    });

    // 4) Public routes (e.g. auth) – mount BEFORE authentication middleware
    // app.post('/api/auth/login', AuthController.login);
    // app.post('/api/auth/refresh', AuthController.refresh);

    // 5) Protected routes
    app.use('/api', authenticateToken, routes);

    // 6) Global error handler
    app.use(errorHandler);

    // 7) Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });

    // 8) Graceful shutdown
    const shutdown = () => {
      console.log('⚡️ Shutting down server...');
      server.close(async () => {
        await AppDataSource.destroy();
        console.log('✅ DataSource has been destroyed');
        process.exit(0);
      });
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (err) {
    console.error('❌ Error during DataSource initialization:', err);
    process.exit(1);
  }
}

startServer();
