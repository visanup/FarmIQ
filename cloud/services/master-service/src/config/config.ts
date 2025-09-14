import { z } from 'zod';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const configSchema = z.object({
  // Server
  PORT: z.string().transform(Number).default('7307'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().default('0.0.0.0'),

  // Database
  DATABASE_URL: z.string().min(1),

  // Kafka
  KAFKA_BROKERS: z.string().default('localhost:9092'),
  KAFKA_SSL: z.string().transform(val => val === 'true').default('false'),
  KAFKA_CLIENT_ID: z.string().default('master-service'),

  // CORS
  CORS_ALLOW_CREDENTIALS: z.string().transform(val => val === 'true').default('true'),
  CORS_ALLOWED_ORIGINS: z.string().default('*'),
  CORS_ALLOW_METHODS: z.string().default('*'),
  CORS_ALLOW_HEADERS: z.string().default('*'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Prometheus
  ENABLE_PROMETHEUS: z.string().transform(val => val === 'true').default('false'),

  // API Keys
  ADMIN_API_KEY: z.string().default('admin-key'),

  // Context7 AI Integration
  CONTEXT7_API_KEY: z.string().optional(),
  CONTEXT7_BASE_URL: z.string().default('https://api.context7.ai'),

  // Swagger Configuration
  SWAGGER_TITLE: z.string().default('Master Service API'),
  SWAGGER_DESCRIPTION: z.string().default('Master data management service for FarmIQ'),
  SWAGGER_VERSION: z.string().default('1.0.0'),
  SWAGGER_BASE_URL: z.string().default('http://localhost:7307'),
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
  CORS_ALLOW_CREDENTIALS,
  CORS_ALLOWED_ORIGINS,
  CORS_ALLOW_METHODS,
  CORS_ALLOW_HEADERS,
  LOG_LEVEL,
  ENABLE_PROMETHEUS,
  ADMIN_API_KEY,
  CONTEXT7_API_KEY,
  CONTEXT7_BASE_URL,
  SWAGGER_TITLE,
  SWAGGER_DESCRIPTION,
  SWAGGER_VERSION,
  SWAGGER_BASE_URL,
} = config;

export type Config = typeof config;
