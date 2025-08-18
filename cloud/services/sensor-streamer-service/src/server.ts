// src/server.ts

import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { AppDataSource } from './utils/dataSource';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { PORT, FLAGS } from './configs/config';
import { initKafka, producer } from './utils/kafka';
import { startStreamerLoop, stopStreamerLoop } from './services/streamer.service';

async function start() {
  try {
    await AppDataSource.initialize();
    console.log('✅ DataSource initialized');

    await initKafka();

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

    // Liveness / basic readiness
    app.get('/health', (_req, res) => {
      const dbOk = AppDataSource.isInitialized;
      res.status(dbOk ? 200 : 500).json({ ok: dbOk });
    });

    // Prometheus metrics (optional)
    if (FLAGS.prometheus) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const client = require('prom-client');
      client.collectDefaultMetrics();
      app.get('/metrics', async (_req, res) => {
        res.set('Content-Type', client.register.contentType);
        res.end(await client.register.metrics());
      });
    }

    app.use('/api', routes);
    app.use(errorHandler);

    const server = app.listen(PORT, () => {
      console.log(`🚀 sensor-streamer-service on http://localhost:${PORT}`);
    });

    // start background streamer loop
    startStreamerLoop();

    const shutdown = async () => {
      console.log('⚡ Shutting down...');
      try { stopStreamerLoop(); } catch {}
      try { await producer.disconnect(); } catch (e) { console.error('⚠️ Kafka disconnect error:', e); }
      try { await AppDataSource.destroy(); } catch (e) { console.error('⚠️ DataSource destroy error:', e); }
      server.close(() => process.exit(0));
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (e) {
    console.error('❌ Failed to start server:', e);
    process.exit(1);
  }
}

start();