// src/configs/config.ts
import * as dotenv from 'dotenv';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { z } from 'zod';

// Load environment variables
const envSchema = z.object({
  DB_HOST: z.string().default('timescaledb'),
  DB_PORT: z.string().default('5432'),
  DB_NAME: z.string().default('sensor_cloud_db'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('password'),
  DB_SCHEMA: z.string().default('analytics'),
  KAFKA_BROKERS: z.string().default('kafka:9092'),
  DATA_SERVICE_PORT: z.string().default('7306'),
  JWT_SECRET_KEY: z.string().min(16),
  ALGORITHM: z.enum(['HS256', 'HS384', 'HS512']).default('HS256'),
  POLL_INTERVAL_SECONDS: z.string().default('60'),
  SLACK_WEBHOOK_URL: z.string().optional(),
  LINE_NOTIFY_TOKEN: z.string().optional(),
  ALERT_BACKEND: z.string().optional(),
  ENV: z.string().default('dev')
});

// Find .env file
function findEnv(): string | undefined {
  const fromEnv = process.env.ENV_PATH;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;
  
  const roots = [process.cwd(), __dirname, join(__dirname, '..')];
  for (const r of roots) {
    let d = r;
    for (let i = 0; i < 4; i++) {
      const p = join(d, '.env');
      if (existsSync(p)) return p;
      d = dirname(d);
    }
  }
  return undefined;
}

// Load environment variables
const envPath = findEnv();
envPath ? dotenv.config({ path: envPath }) : dotenv.config();

// Validate environment variables
const envResult = envSchema.safeParse(process.env);
if (!envResult.success) {
  console.error('❌ Invalid environment variables:');
  console.error(envResult.error.format());
  process.exit(1);
}

// Destructure environment variables
export const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_SCHEMA,
  KAFKA_BROKERS,
  DATA_SERVICE_PORT,
  JWT_SECRET_KEY,
  ALGORITHM,
  POLL_INTERVAL_SECONDS,
  SLACK_WEBHOOK_URL,
  LINE_NOTIFY_TOKEN,
  ALERT_BACKEND,
  ENV
} = envResult.data;

// Create database URL
export const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

// Export PORT for server
export const PORT = parseInt(DATA_SERVICE_PORT);

// Export JWT_SECRET for auth
export const JWT_SECRET = JWT_SECRET_KEY;

// Log environment
if (ENV === 'dev') {
  console.log('🧪 Development environment');
} else if (ENV === 'prod') {
  console.log('🚀 Production environment');
} else {
  console.log(`📦 Environment: ${ENV}`);
}