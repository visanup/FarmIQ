// src/server.ts
import express from 'express';
import type { Server } from 'http';
import client from 'prom-client';
import { env } from './configs/config';
import { AppDataSource } from './utils/dataSource';
import { logger } from './utils/logger';
import { runConsumers } from './consumers'; // ⬅️ ใช้ตัวรวมทุก topic
import { every } from './utils/scheduler';
import { publishFinalizedMinuteFeatures } from './services/featurePublisher';
import { redis } from './stores/redis';
import { consumer } from './utils/kafka'; // สำหรับ graceful shutdown

let isReady = false;
let server: Server | undefined;

(async () => {
  try {
    // 1) DB init + migrations
    await AppDataSource.initialize();
    await AppDataSource.runMigrations();
    logger.info('✅ DB ready');

    // 2) Kafka consumers (สมัครทุก topic จาก routes)
    await runConsumers();
    isReady = true;

    // 3) งาน background (publish features เป็นระยะ)
    every(10_000, publishFinalizedMinuteFeatures);

    // 4) HTTP server + metrics
    const app = express();
    const reg = new client.Registry();
    client.collectDefaultMetrics({ register: reg });

    app.get('/health', async (_req, res) => {
      try {
        await redis.ping();
        res.json({ ok: true });
      } catch (err) {
        res.status(500).json({ ok: false, error: String(err) });
      }
    });

    app.get('/ready', (_req, res) => {
      if (isReady) return res.json({ ok: true });
      return res.status(503).json({ ok: false });
    });

    app.get('/metrics', async (_req, res) => {
      res.set('Content-Type', reg.contentType);
      res.end(await reg.metrics());
    });

    const port = Number(env.ANALYTIC_STREAM_PORT) || 7303;
    server = app.listen(port, () =>
      logger.info(`🚀 analytics-stream http://0.0.0.0:${port}`)
    );

    // 5) Graceful shutdown
    const shutdown = async (signal: NodeJS.Signals) => {
      logger.warn({ signal }, 'graceful-shutdown');
      try { server?.close(); } catch {}
      try { await consumer.disconnect(); } catch {}
      try { await AppDataSource.destroy(); } catch {}
      try { await redis.quit(); } catch {}
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    logger.error({ err }, 'fatal-startup-error');
    process.exit(1);
  }
})();

