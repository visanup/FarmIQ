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

export const PORT = Number(process.env.CUSTOMER_SERVICE_PORT ?? 7301);

// Prefer DATABASE_URL; fallback to discrete fields
export const DATABASE_URL =
  process.env.DATABASE_URL ??
  `postgres://${encodeURIComponent(process.env.DB_USER ?? 'postgres')}:${encodeURIComponent(
    process.env.DB_PASSWORD ?? 'password'
  )}@${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? '5432'}/${process.env.DB_NAME ?? '03_customers_db'}`;

export const JWT_ALG: Algorithm = (process.env.ALGORITHM as Algorithm) || 'HS256';
export const JWT_SECRET = process.env.JWT_SECRET_KEY || ''; // for HS256
export const JWKS_URL = process.env.JWKS_URL;               // for RS256 (optional)

if (JWT_ALG.startsWith('HS') && !JWT_SECRET) {
  console.error('❌ Missing JWT_SECRET_KEY for HS* algorithm');
  process.exit(1);
}
