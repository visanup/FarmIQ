// src/configs/config.ts
import * as dotenv from 'dotenv';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import { z } from '../utils/zod';

/** ค้นหาไฟล์ .env แบบเบาๆ แต่ได้ผล */
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

const envPath = findEnv();
if (envPath) {
  dotenv.config({ path: envPath });
  console.log(`[config] loaded .env from: ${envPath}`);
} else {
  dotenv.config();
  console.warn('[config] .env not found; using process.env only');
}

/** เติม DATABASE_URL อัตโนมัติถ้ายังไม่ถูกกำหนด (รองรับ DB_* / CLOUD_DB_*) */
(function synthesizeDbUrl() {
  if (process.env.DATABASE_URL) return;

  const host = process.env.DB_HOST || process.env.CLOUD_DB_HOST;
  const port = process.env.DB_PORT || process.env.CLOUD_DB_PORT || '5432';
  const name = process.env.DB_NAME || process.env.CLOUD_DB_NAME;
  const user = process.env.DB_USER || process.env.CLOUD_DB_USER;
  const pass = process.env.DB_PASSWORD || process.env.CLOUD_DB_PASSWORD;

  if (host && name && user !== undefined && pass !== undefined) {
    process.env.DATABASE_URL =
      `postgres://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${name}`;
    console.log('[config] synthesized DATABASE_URL from *_DB_* variables');
  }
})();

/** ค่า PORT เริ่มต้น: SENSOR_STREAMER_PORT > PORT > 7302 */
const RawPortDefault = (() => {
  const p = process.env.SENSOR_STREAMER_PORT || process.env.PORT;
  const n = Number(p);
  return Number.isFinite(n) && n > 0 ? n : 7302;
})();

/** helper: แปลง string -> boolean แบบคุมเข้ม */
const strictBool = (v: unknown) => {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(s)) return true;
    if (['0', 'false', 'no', 'off', ''].includes(s)) return false;
  }
  return v; // ให้ schema ด้านล่างตัดสินต่อ
};

/** Validate + normalize env ด้วย zod */
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.string().default('info'),

  PORT: z.coerce.number().int().positive().default(RawPortDefault),

  // ต้องมีอย่างน้อยหนึ่งอัน
  API_KEY: z.string().min(8).optional(),
  ADMIN_API_KEY: z.string().min(8).optional(),

  DATABASE_URL: z.string().url(),
  DB_SCHEMA: z.string().default('sensors'),

  KAFKA_CLIENT_ID: z.string().default('sensor-streamer'),
  KAFKA_BROKERS: z.string().transform(s =>
    s.split(',').map(x => x.trim()).filter(Boolean)
  ),
  // เข้มงวดเรื่อง boolean + มีแฟลกบังคับปิด TLS
  KAFKA_SSL: z.preprocess(strictBool, z.boolean().default(false)),
  FORCE_KAFKA_SSL_OFF: z.preprocess(strictBool, z.boolean().default(false)).optional(),

  KAFKA_SASL_MECHANISM: z.enum(['plain', 'scram-sha-256', 'scram-sha-512']).optional(),
  KAFKA_SASL_USERNAME: z.string().optional(),
  KAFKA_SASL_PASSWORD: z.string().optional(),

  TOPIC_DEVICE_READINGS: z.string().default('sensors.device.readings'),
  TOPIC_DEVICE_HEALTH: z.string().default('sensors.device.health'),
  TOPIC_LAB_READINGS: z.string().default('sensors.lab.readings'),
  TOPIC_SWEEP_READINGS: z.string().default('sensors.sweep.readings'),

  TENANT_FILTER: z
    .string()
    .optional()
    .transform(v => (v ? v.split(',').map(s => s.trim()).filter(Boolean) : undefined)),
  BATCH_SIZE: z.coerce.number().int().positive().max(20000).default(5000),
  POLL_INTERVAL_MS: z.coerce.number().int().positive().default(1000),
  MAX_LAG_SECONDS: z.coerce.number().int().positive().default(60),

  ENABLE_PROMETHEUS: z.preprocess(strictBool, z.boolean().default(true)),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('[config] invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

// ต้องมี API key อย่างน้อยหนึ่งอัน
const effectiveApiKey = env.API_KEY ?? env.ADMIN_API_KEY;
if (!effectiveApiKey) {
  console.error('[config] Missing API key: set API_KEY or ADMIN_API_KEY (min length 8)');
  process.exit(1);
}

export const ENV = env;

// ---------- Server ----------
export const NODE_ENV = ENV.NODE_ENV;
export const LOG_LEVEL = ENV.LOG_LEVEL;
export const PORT = ENV.PORT;               // ✅ default 7302
export const ADMIN_API_KEY = effectiveApiKey;

// ---------- DB ----------
export const DATABASE_URL = ENV.DATABASE_URL;
export const DB_SCHEMA = ENV.DB_SCHEMA;

// ---------- Kafka ----------
export const KAFKA = {
  clientId: ENV.KAFKA_CLIENT_ID,
  brokers: ENV.KAFKA_BROKERS,                                  // e.g. ["kafka:9092"]
  ssl: ENV.FORCE_KAFKA_SSL_OFF ? false : ENV.KAFKA_SSL,        // มีแฟลกบังคับปิด TLS
  sasl: ENV.KAFKA_SASL_MECHANISM
    ? {
        mechanism: ENV.KAFKA_SASL_MECHANISM,
        username: ENV.KAFKA_SASL_USERNAME!,
        password: ENV.KAFKA_SASL_PASSWORD!,
      }
    : undefined,
  topics: {
    deviceReadings: ENV.TOPIC_DEVICE_READINGS,
    deviceHealth:   ENV.TOPIC_DEVICE_HEALTH,
    labReadings:    ENV.TOPIC_LAB_READINGS,
    sweepReadings:  ENV.TOPIC_SWEEP_READINGS,
  },
} as const;

// ---------- Streamer ----------
export const STREAMER = {
  tenantFilter: ENV.TENANT_FILTER,
  batchSize: ENV.BATCH_SIZE,
  pollIntervalMs: ENV.POLL_INTERVAL_MS,
  maxLagSeconds: ENV.MAX_LAG_SECONDS,
} as const;

// ---------- Feature flags ----------
export const FLAGS = { prometheus: ENV.ENABLE_PROMETHEUS } as const;
