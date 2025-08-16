// src/configs/config.ts
import * as dotenv from 'dotenv';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

/** locate .env (optional; compose อาจใส่ env ให้แล้ว) */
function locateEnvFile(filename = '.env'): string | undefined {
  const fromEnv = process.env.ENV_PATH;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;

  const roots = [process.cwd(), __dirname, join(__dirname, '..'), join(__dirname, '../..'), join(__dirname, '../../..')];
  for (const root of roots) {
    let current = root;
    for (let i = 0; i < 6; i++) {
      const cand = join(current, filename);
      if (existsSync(cand)) return cand;
      current = dirname(current);
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
  console.log('[config] no local .env file; relying on process.env');
}

/** helpers */
const asBool = (v: any, def = false) =>
  (v === undefined || v === null) ? def : String(v).trim().toLowerCase() === 'true';
const asNum  = (v: any, def: number) => (v === undefined ? def : Number(v) || def);
/** เลือกค่า “ตัวแรกที่ไม่ว่าง” */
const pick = (...vals: (string | undefined | null)[]) =>
  vals.find(v => typeof v === 'string' && v.trim().length > 0) || '';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

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



