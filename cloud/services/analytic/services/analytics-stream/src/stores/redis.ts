// src/stores/redis.ts

import Redis from 'ioredis';
import { env } from '../configs/config';

export const redis = new Redis(env.REDIS_URL);

