import { z } from 'zod';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const configSchema = z.object({
  // Server
  PORT: z.string().transform(Number).default('7300'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().default('0.0.0.0'),

  // Database
  DATABASE_URL: z.string().min(1),

  // JWT
  JWT_SECRET: z.string().min(1),
  JWT_ALGORITHM: z.enum(['HS256', 'HS384', 'HS512']).default('HS256'),
  ACCESS_TOKEN_EXPIRE_MINUTES: z.string().transform(Number).default('1440'),
  REFRESH_TOKEN_EXPIRE_DAYS: z.string().transform(Number).default('7'),

  // CORS
  CORS_ALLOW_CREDENTIALS: z.string().transform(val => val === 'true').default('true'),
  CORS_ALLOWED_ORIGINS: z.string().default('*'),
  CORS_ALLOW_METHODS: z.string().default('*'),
  CORS_ALLOW_HEADERS: z.string().default('*'),

  // Kafka
  KAFKA_BROKERS: z.string().default('localhost:9092'),
  KAFKA_SSL: z.string().transform(val => val === 'true').default('false'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const config = configSchema.parse(process.env);

export const {
  PORT,
  NODE_ENV,
  HOST,
  DATABASE_URL,
  JWT_SECRET,
  JWT_ALGORITHM,
  ACCESS_TOKEN_EXPIRE_MINUTES,
  REFRESH_TOKEN_EXPIRE_DAYS,
  CORS_ALLOW_CREDENTIALS,
  CORS_ALLOWED_ORIGINS,
  CORS_ALLOW_METHODS,
  CORS_ALLOW_HEADERS,
  KAFKA_BROKERS,
  KAFKA_SSL,
  LOG_LEVEL,
} = config;

export type Config = typeof config;

