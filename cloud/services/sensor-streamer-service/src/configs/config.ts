import { z } from 'zod';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const configSchema = z.object({
  // Server
  PORT: z.string().transform(Number).default('7302'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().default('0.0.0.0'),

  // Database
  DATABASE_URL: z.string().min(1),

  // Kafka
  KAFKA_BROKERS: z.string().default('localhost:9092'),
  KAFKA_SSL: z.string().transform(val => val === 'true').default('false'),
  KAFKA_CLIENT_ID: z.string().default('sensor-streamer-service'),

  // MQTT
  MQTT_BROKER_URL: z.string().optional(),
  MQTT_USERNAME: z.string().optional(),
  MQTT_PASSWORD: z.string().optional(),

  // MinIO
  MINIO_ENDPOINT: z.string().optional(),
  MINIO_PORT: z.string().transform(Number).optional(),
  MINIO_ACCESS_KEY: z.string().optional(),
  MINIO_SECRET_KEY: z.string().optional(),
  MINIO_USE_SSL: z.string().transform(val => val === 'true').default('false'),

  // CORS
  CORS_ALLOW_CREDENTIALS: z.string().transform(val => val === 'true').default('true'),
  CORS_ALLOWED_ORIGINS: z.string().default('*'),
  CORS_ALLOW_METHODS: z.string().default('*'),
  CORS_ALLOW_HEADERS: z.string().default('*'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Prometheus
  ENABLE_PROMETHEUS: z.string().transform(val => val === 'true').default('false'),

  // Streamer
  STREAMER_INTERVAL_MS: z.string().transform(Number).default('5000'),
  BATCH_SIZE: z.string().transform(Number).default('100'),

  // API Keys
  ADMIN_API_KEY: z.string().default('admin-key'),
});

const config = configSchema.parse(process.env);

export const {
  PORT,
  NODE_ENV,
  HOST,
  DATABASE_URL,
  KAFKA_BROKERS,
  KAFKA_SSL,
  KAFKA_CLIENT_ID,
  MQTT_BROKER_URL,
  MQTT_USERNAME,
  MQTT_PASSWORD,
  MINIO_ENDPOINT,
  MINIO_PORT,
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
  MINIO_USE_SSL,
  CORS_ALLOW_CREDENTIALS,
  CORS_ALLOWED_ORIGINS,
  CORS_ALLOW_METHODS,
  CORS_ALLOW_HEADERS,
  LOG_LEVEL,
  ENABLE_PROMETHEUS,
  STREAMER_INTERVAL_MS,
  BATCH_SIZE,
  ADMIN_API_KEY,
} = config;

export type Config = typeof config;