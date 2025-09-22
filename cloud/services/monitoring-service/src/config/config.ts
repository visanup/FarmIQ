import * as dotenv from 'dotenv';
import { join } from 'path';
import { z } from 'zod';

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

// Configuration schema
const configSchema = z.object({
  // Server
  PORT: z.string().transform(Number).default('4112'),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SERVICE_NAME: z.string().default('Monitoring Service'),

  // Database
  DATABASE_URL: z.string().min(1),

  // JWT
  JWT_SECRET: z.string().min(16).default('monitoring-service-secret'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  ALGORITHM: z.string().default('HS256'),

  // CORS
  CORS_ALLOWED_ORIGINS: z.string().default('*'),
  CORS_ALLOW_CREDENTIALS: z.string().transform(val => val === 'true').default('false'),
  CORS_ALLOW_METHODS: z.string().default('GET,POST,PUT,DELETE,OPTIONS'),
  CORS_ALLOW_HEADERS: z.string().default('Content-Type,Authorization'),

  // Kafka
  KAFKA_BROKERS: z.string().default('kafka:9092'),
  KAFKA_CLIENT_ID: z.string().default('monitoring-service'),
  CONSUMER_GROUP: z.string().default('monitoring-group'),

  // Kafka Topics
  TOPIC_DEVICE_HEALTH: z.string().default('sensors.device.health.v1'),
  TOPIC_ANALYTICS_ALERTS: z.string().default('analytics.anomaly.v1'),
  TOPIC_MONITORING_ALERTS: z.string().default('monitoring.alerts.v1'),
  TOPIC_MONITORING_HEALTH: z.string().default('monitoring.health.v1'),
});

const config = configSchema.parse(process.env);

// Server configuration
export const PORT = config.PORT;
export const HOST = config.HOST;
export const NODE_ENV = config.NODE_ENV;
export const SERVICE_NAME = config.SERVICE_NAME;

// Database configuration
export const DATABASE_URL = config.DATABASE_URL;

// JWT configuration
export const JWT_SECRET = config.JWT_SECRET;
export const JWT_EXPIRES_IN = config.JWT_EXPIRES_IN;
export const ALGORITHM = config.ALGORITHM;

// CORS configuration
export const CORS_ALLOWED_ORIGINS = config.CORS_ALLOWED_ORIGINS;
export const CORS_ALLOW_CREDENTIALS = config.CORS_ALLOW_CREDENTIALS;
export const CORS_ALLOW_METHODS = config.CORS_ALLOW_METHODS;
export const CORS_ALLOW_HEADERS = config.CORS_ALLOW_HEADERS;

// Kafka configuration
export const KAFKA_BROKERS = config.KAFKA_BROKERS;
export const KAFKA_CLIENT_ID = config.KAFKA_CLIENT_ID;
export const CONSUMER_GROUP = config.CONSUMER_GROUP;

// Kafka Topics
export const TOPIC_DEVICE_HEALTH = config.TOPIC_DEVICE_HEALTH;
export const TOPIC_ANALYTICS_ALERTS = config.TOPIC_ANALYTICS_ALERTS;
export const TOPIC_MONITORING_ALERTS = config.TOPIC_MONITORING_ALERTS;
export const TOPIC_MONITORING_HEALTH = config.TOPIC_MONITORING_HEALTH;
