import { z } from 'zod';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const configSchema = z.object({
  // Server
  PORT: z.string().transform(Number).default('7301'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().default('0.0.0.0'),

  // Database
  DATABASE_URL: z.string().min(1),

  // Kafka
  KAFKA_BROKERS: z.string().default('localhost:9092'),
  KAFKA_SSL: z.string().transform(val => val === 'true').default('false'),

  // CORS
  CORS_ALLOW_CREDENTIALS: z.string().transform(val => val === 'true').default('true'),
  CORS_ALLOWED_ORIGINS: z.string().default('*'),
  CORS_ALLOW_METHODS: z.string().default('*'),
  CORS_ALLOW_HEADERS: z.string().default('*'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const config = configSchema.parse(process.env);

export const {
  PORT,
  NODE_ENV,
  HOST,
  DATABASE_URL,
  KAFKA_BROKERS,
  KAFKA_SSL,
  CORS_ALLOW_CREDENTIALS,
  CORS_ALLOWED_ORIGINS,
  CORS_ALLOW_METHODS,
  CORS_ALLOW_HEADERS,
  LOG_LEVEL,
} = config;

export type Config = typeof config;