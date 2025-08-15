// services/sensor-service/src/configs/config.ts

import * as dotenv from 'dotenv';
import { join } from 'path';
import { Algorithm } from 'jsonwebtoken';

// โหลด .env จาก root ของ repo
dotenv.config({ path: join(__dirname, '../../.env') });

// 1) Database settings
export const DB_HOST     = process.env.DB_HOST     || 'localhost';
export const DB_PORT     = Number(process.env.DB_PORT) || 5432;
export const DB_NAME     = process.env.DB_NAME     || 'edge_db';
export const DB_USER     = process.env.DB_USER     || 'postgres';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'password';

export const DATABASE_URL = process.env.DATABASE_URL ||
  `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

// 2) Server port
export const PORT = Number(process.env.DATA_SERVICE_PORT) || 4107;

// 3) JWT settings
if (!process.env.JWT_SECRET_KEY) {
  console.error('❌ Missing JWT_SECRET_KEY! Check your .env files and paths.');
  process.exit(1);
}
export const JWT_SECRET = process.env.JWT_SECRET_KEY;

export const ACCESS_TOKEN_EXPIRE_MINUTES = process.env.TOKEN_EXPIRATION_MINUTES
  ? parseInt(process.env.TOKEN_EXPIRATION_MINUTES, 10)
  : 1440;

export const REFRESH_TOKEN_EXPIRE_DAYS = process.env.REFRESH_TOKEN_EXPIRE_DAYS
  ? parseInt(process.env.REFRESH_TOKEN_EXPIRE_DAYS, 10)
  : 7;

// 4) JWT Algorithm
export const ALGORITHM: Algorithm =
  (process.env.ALGORITHM as Algorithm) || 'HS256';

