// src/configs/config.ts
import * as dotenv from 'dotenv';
import { join } from 'path';

// โหลด .env จาก root ของ repo
dotenv.config({ path: join(__dirname, '../../.env') });

// 1) Edge Database settings
export const DB_HOST     = process.env.DB_HOST     || 'localhost';
export const DB_PORT     = Number(process.env.DB_PORT) || 5432;
export const DB_NAME     = process.env.DB_NAME     || 'edge_db';
export const DB_USER     = process.env.DB_USER     || 'postgres';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'password';

export const EDGE_DATABASE_URL = process.env.EDGE_DATABASE_URL ||
  `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
console.log(`Using EDGE_DATABASE_URL: ${EDGE_DATABASE_URL}`);

// 2) Cloud Database settings
export const CLOUD_DB_HOST     = process.env.CLOUD_DB_HOST     || 'localhost';
export const CLOUD_DB_PORT     = Number(process.env.CLOUD_DB_PORT) || 5432;
export const CLOUD_DB_NAME     = process.env.CLOUD_DB_NAME     || 'cloud_db';
export const CLOUD_DB_USER     = process.env.CLOUD_DB_USER     || 'postgres';
export const CLOUD_DB_PASSWORD = process.env.CLOUD_DB_PASSWORD || 'password';

export const CLOUD_DATABASE_URL = process.env.CLOUD_DATABASE_URL ||
  `postgresql://${CLOUD_DB_USER}:${CLOUD_DB_PASSWORD}@${CLOUD_DB_HOST}:${CLOUD_DB_PORT}/${CLOUD_DB_NAME}`;
console.log(`Using CLOUD_DATABASE_URL: ${CLOUD_DATABASE_URL}`);

// 3) Server port
export const PORT = Number(process.env.SYNC_PORT) || 4104;



