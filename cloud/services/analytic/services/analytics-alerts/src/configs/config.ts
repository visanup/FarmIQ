// src/configs/config.ts
import * as dotenv from 'dotenv';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import type { Algorithm } from 'jsonwebtoken';

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
}
const envPath = findEnv();
envPath ? dotenv.config({ path: envPath }) : dotenv.config();

// 4) Database settings
export const DB_HOST = process.env.DB_HOST!;
export const DB_PORT = Number(process.env.DB_PORT) || 5432;
export const DB_NAME = process.env.DB_NAME!;
export const DB_USER = process.env.DB_USER!;
export const DB_PASSWORD = process.env.DB_PASSWORD!;

export const DATABASE_URL =
  process.env.DATABASE_URL ||
  `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

// 5) Server port (rename env var to DATA_SERVICE_PORT for consistency)
export const PORT = Number(process.env.DATA_SERVICE_PORT) || 4111;
console.log('Port:', PORT);

// 6) JWT settings
const secret = process.env.JWT_SECRET_KEY;
if (!secret) {
  console.error('❌ Missing JWT_SECRET_KEY! Check your .env files and paths.');
  process.exit(1);
}
export const JWT_SECRET = secret;

export const ACCESS_TOKEN_EXPIRE_MINUTES =
  Number(process.env.TOKEN_EXPIRATION_MINUTES) || 1440;
export const REFRESH_TOKEN_EXPIRE_DAYS =
  Number(process.env.REFRESH_TOKEN_EXPIRE_DAYS) || 7;

// 7) Algorithm (fixed syntax)
export const ALGORITHM: Algorithm =
  (process.env.ALGORITHM as Algorithm) || 'HS256';

// 8) Kafka
export const KAFKA_BROKER =
  process.env.KAFKA_BROKER || 'http://localhost:9092';
