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
  JWT_ALGORITHM: z.string().trim().pipe(z.enum(['HS256', 'HS384', 'HS512'])).default('HS256'),
  JWT_ISSUER: z.string().default('farmiq-auth'),
  JWT_AUDIENCE: z.string().default('farmiq-clients'),
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
  KAFKA_TOPIC_USER: z.string().default('auth.user'),
  KAFKA_TOPIC_TOKEN: z.string().default('auth.token'),

  // Email (optional)
  EMAIL_FROM: z.string().default('no-reply@farmiq.local'),
  APP_BASE_URL: z.string().default('http://localhost:7300'),

  // Proxy to master-service (customers)
  MASTER_SERVICE_URL: z.string().default('http://localhost:7400'),

  // Logging
  LOG_LEVEL: z.string().trim().pipe(z.enum(['error', 'warn', 'info', 'debug'])).default('info'),
});

const config = configSchema.parse(process.env);

export const {
  PORT,
  NODE_ENV,
  HOST,
  DATABASE_URL,
  JWT_SECRET,
  JWT_ALGORITHM,
  JWT_ISSUER,
  JWT_AUDIENCE,
  ACCESS_TOKEN_EXPIRE_MINUTES,
  REFRESH_TOKEN_EXPIRE_DAYS,
  CORS_ALLOW_CREDENTIALS,
  CORS_ALLOWED_ORIGINS,
  CORS_ALLOW_METHODS,
  CORS_ALLOW_HEADERS,
  KAFKA_BROKERS,
  KAFKA_SSL,
  KAFKA_TOPIC_USER,
  KAFKA_TOPIC_TOKEN,
  EMAIL_FROM,
  APP_BASE_URL,
  MASTER_SERVICE_URL,
  LOG_LEVEL,
} = config;

export type Config = typeof config;
