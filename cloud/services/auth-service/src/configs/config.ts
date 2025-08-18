// src/configs/config.ts

import * as dotenv from 'dotenv';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import type { Algorithm } from 'jsonwebtoken';

/** หาไฟล์ .env แบบยืดหยุ่น */
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

/** สร้าง DATABASE_URL อัตโนมัติถ้ายังไม่มี โดยอาศัย CLOUD_DB_* หรือ DB_* */
(function synthesizeDbUrl() {
  if (process.env.DATABASE_URL) return;

  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT|| '5432';
  const name = process.env.DB_NAME;
  const user = process.env.DB_USER;
  const pass = process.env.DB_PASSWORD ;

  if (host && name && user != null && pass != null) {
    process.env.DATABASE_URL =
      `postgres://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${name}`;
    console.log('[config] synthesized DATABASE_URL from *_DB_* variables');
  }
})();

/** พอร์ตของเซอร์วิส (รองรับทั้ง AUTH_PORT และ AUTH_SERVICE_PORT) */
export const PORT = Number(process.env.AUTH_PORT || process.env.AUTH_SERVICE_PORT || 7300);

/** DB URL */
export const DATABASE_URL = process.env.DATABASE_URL!;

/** Customer Service URL
 *  ลำดับความสำคัญ:
 *   1) CUSTOMER_SERVICE_URL
 *   2) CUSTOMER_SERVICE_HOST + CUSTOMER_SERVICE_PORT + /api/customers
 *   3) fallback localhost:4107
 */
const CUSTOMER_HOST = process.env.CUSTOMER_SERVICE_HOST || 'http://localhost';
const CUSTOMER_PORT = process.env.CUSTOMER_SERVICE_PORT || '4107';
export const CUSTOMER_SERVICE_URL =
  process.env.CUSTOMER_SERVICE_URL || `${CUSTOMER_HOST}:${CUSTOMER_PORT}/api/customers`;

/** JWT */
export const JWT_SECRET = process.env.JWT_SECRET_KEY!;
export const ALGORITHM: Algorithm = (process.env.ALGORITHM as Algorithm) || 'HS256';
export const ACCESS_TOKEN_EXPIRE_MINUTES =
  Number(process.env.TOKEN_EXPIRATION_MINUTES) || 1440;
export const REFRESH_TOKEN_EXPIRE_DAYS =
  Number(process.env.REFRESH_TOKEN_EXPIRE_DAYS) || 7;

/** CORS (อ่านจาก ENV) */
export const CORS_ALLOW_CREDENTIALS = String(process.env.CORS_ALLOW_CREDENTIALS || 'true') === 'true';
export const CORS_ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS || '*')
  .split(',')
  .map(s => s.trim());
export const CORS_ALLOW_METHODS = (process.env.CORS_ALLOW_METHODS || '*');
export const CORS_ALLOW_HEADERS = (process.env.CORS_ALLOW_HEADERS || '*');

