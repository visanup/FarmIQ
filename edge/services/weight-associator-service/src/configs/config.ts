// src/configs/config.ts

import * as dotenv from 'dotenv';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

/** หาไฟล์ .env ให้ฉลาดขึ้น:
 *  - ถ้ามี ENV_PATH และไฟล์มีอยู่ ใช้อันนั้นเลย
 *  - ลองไล่หา .env จาก cwd และจากตำแหน่งไฟล์ที่คอมไพล์ (__dirname) ย้อนขึ้นไปหลายชั้น
 */
function locateEnvFile(filename = '.env'): string | undefined {
  const fromEnv = process.env.ENV_PATH;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;

  const roots = [
    process.cwd(),
    __dirname,
    join(__dirname, '..'),
    join(__dirname, '../..'),
    join(__dirname, '../../..'),
  ];

  for (const root of roots) {
    let currentDir = root;
    for (let i = 0; i < 6; i++) {
      const candidate = join(currentDir, filename);
      if (existsSync(candidate)) return candidate;
      currentDir = dirname(currentDir);
    }
  }
  return undefined;
}

const envPath = locateEnvFile();
if (envPath) {
  dotenv.config({ path: envPath });
  console.log(`[config] loaded .env from: ${envPath}`);
} else {
  dotenv.config();
  console.warn('[config] .env not found; using process.env only');
}

/** helper: require ค่าจาก env แบบชัด ๆ */
function requireEnv(name: string): string {
  const v = process.env[name];
  if (typeof v !== 'string' || v.length === 0) {
    throw new Error(`Missing required env: ${name}`);
  }
  return v;
}

// ---------- DB ----------
export const DB_HOST = requireEnv('DB_HOST');
export const DB_PORT = Number(process.env.DB_PORT || 5432);
export const DB_NAME = requireEnv('DB_NAME');
export const DB_USER = requireEnv('DB_USER');
export const DB_PASSWORD = requireEnv('DB_PASSWORD');
export const DATABASE_URL =
  process.env.DATABASE_URL || `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
export const DB_SCHEMA = process.env.DB_SCHEMA || 'sensors';

// ---------- Server ----------
export const PORT = Number(process.env.WEIGHT_ASSOCIATOR_PORT || process.env.PORT || 6312);
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// ---------- Security ----------
export const API_KEY = requireEnv('API_KEY');
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || '';
export const TOKEN_EXPIRATION_MINUTES = Number(process.env.TOKEN_EXPIRATION_MINUTES || 1440);

// ---------- MQTT ----------
export const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
export const MQTT_USER = process.env.MQTT_USER || '';
export const MQTT_PASSWORD = process.env.MQTT_PASSWORD || '';
// ใช้ routing key เดียว (style a.b -> แปลงเป็น topic a/b ใน mqtt.ts)
export const ROUTING_KEY =
  process.env.ROUTING_KEY ||
  process.env.RAW_ROUTING_KEY || // fallback เผื่อยังตั้งของเดิม
  'image.created';
export const IMG_CREATED_RK = process.env.IMG_CREATED_RK || process.env.ROUTING_KEY || 'image.created';
export const WEIGHT_ASSOCIATED_RK = process.env.WEIGHT_ASSOCIATED_RK || 'weight.associated';

// Matching window
export const ASSOC_WINDOW_MS = Number(process.env.ASSOC_WINDOW_MS || 5000);