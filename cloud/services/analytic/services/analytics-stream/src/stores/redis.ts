// src/stores/redis.ts

import Redis, { RedisOptions } from 'ioredis';
import { env } from '../configs/config';
import { logger } from '../utils/logger';

let instance: Redis | null = null;

function createClient(): Redis {
  const url = env.REDIS_URL;
  const isTls = url.startsWith('rediss://');
  const options: RedisOptions = {
    // reasonable defaults for services
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy: (times) => Math.min(1000 * times, 10_000),
    reconnectOnError: (err) => {
      const msg = err?.message || '';
      // reconnect on READONLY or connection reset
      if (msg.includes('READONLY') || msg.includes('ECONNRESET')) return true;
      return false;
    },
    tls: isTls ? {} : undefined,
  };

  const client = new Redis(url, options);
  client.on('connect', () => logger.info('redis-connect'));
  client.on('ready', () => logger.info('redis-ready'));
  client.on('error', (err) => logger.error({ err }, 'redis-error'));
  client.on('end', () => logger.warn('redis-connection-ended'));
  return client;
}

export const redis: Redis = instance ?? (instance = createClient());

