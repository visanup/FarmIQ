// configs/config.ts
import * as dotenv from 'dotenv';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { z } from 'zod';

/** locate .env (supports ENV_PATH) */
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
envPath ? dotenv.config({ path: envPath }) : dotenv.config();

/** helpers */
const str = () => z.string().transform(s => s.trim());
const url = () => z.string().url().transform(s => s.trim());
const listFromCSV = (s: string) =>
  s.split(',').map(x => x.trim()).filter(Boolean);

const RawEnv = z.object({
  SERVICE_NAME: str().default('analytics-stream'),
  ANALYTIC_STREAM_PORT: z.coerce.number().int().positive().default(7303),

  // Kafka
  KAFKA_CLIENT_ID: str().default('analytics-stream'),
  CONSUMER_GROUP: str().default('analytic-service.v1'),
  KAFKA_BROKERS: str().default('kafka:9092'), // comma-separated
  // ทำ optional เพื่อให้เราสร้าง default จากรายการ TOPIC_* ได้อัตโนมัติ
  KAFKA_TOPICS_IN: str().optional(),
  KAFKA_TOPIC_OUT: str().default('analytics.features'),
  KAFKA_TOPIC_DLQ: str().default('analytics.invalid-readings'),

  // --- TOPICS (ปรับ default ได้ตาม cluster ของคุณ) ---
  TOPIC_SENSORS:          str().default('sensors.device.readings'),
  TOPIC_DEVICE_HEALTH:    str().default('sensors.device.health.v1'),
  TOPIC_LAB_READINGS:     str().default('sensors.lab.readings.v1'),
  TOPIC_SWEEP_READINGS:   str().default('sensors.sweep.readings.v1'),
  TOPIC_WEATHER:          str().default('external.weather.observation.v1'),
  TOPIC_OPS:              str().default('farms.operational.event.v1'),
  TOPIC_FEED_BATCH:       str().default('feed.batch.created.v1'),
  TOPIC_FEED_QUALITY:     str().default('feed.quality.result.v1'),
  TOPIC_ECON_TXN:         str().default('economics.cost.txn.v1'),
  TOPIC_DEVICE_SNAPSHOT:  str().default('devices.device.snapshot.v1'),
  TOPIC_FARM_SNAPSHOT:    str().default('farms.farm.snapshot.v1'),
  TOPIC_HOUSE_SNAPSHOT:   str().default('farms.house.snapshot.v1'),
  TOPIC_FLOCK_SNAPSHOT:   str().default('farms.flock.snapshot.v1'),
  // อนาคต (ถ้าจะใช้)
  TOPIC_FEATURES:         str().default('analytics.features.materialized.v1'),
  TOPIC_PREDICTIONS:      str().default('analytics.prediction.v1'),
  TOPIC_ANOMALIES:        str().default('analytics.anomaly.v1'),

  // DB (รองรับทั้ง URL และองค์ประกอบแยก)
  DATABASE_URL: url().optional(),
  DB_HOST: str().default('timescaledb'),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_NAME: str().default('sensor_cloud_db'),
  DB_USER: str().default('postgres'),
  DB_PASSWORD: str().default('password'),
  DB_SCHEMA: str().default('analytics'),

  // Cache
  REDIS_URL: url(),

  // Tuning
  FEATURE_TTL_SECONDS: z.coerce.number().int().positive().default(86400),
  POLL_INTERVAL_MS: z.coerce.number().int().positive().default(1000),
  BATCH_SIZE: z.coerce.number().int().positive().default(5000),
  MAX_LAG_SECONDS: z.coerce.number().int().nonnegative().default(60),

  TENANT_FILTER: str().optional().default(''),
});

type RawEnvT = z.infer<typeof RawEnv>;
const parsed = RawEnv.parse(process.env);

/** compose DATABASE_URL if missing */
function buildDatabaseUrl(p: RawEnvT) {
  const pwd = encodeURIComponent(p.DB_PASSWORD);
  return `postgres://${p.DB_USER}:${pwd}@${p.DB_HOST}:${p.DB_PORT}/${p.DB_NAME}`;
}

export type Env = RawEnvT & { DATABASE_URL: string };

export const env: Env = {
  ...parsed,
  DATABASE_URL: parsed.DATABASE_URL ?? buildDatabaseUrl(parsed),
};

/** Kafka helpers */
export const brokers = listFromCSV(env.KAFKA_BROKERS);

// ถ้า .env ไม่กำหนด KAFKA_TOPICS_IN → ใช้ default ครบทุกโดเมนที่เรารองรับ
const defaultInputTopics = [
  env.TOPIC_SENSORS,
  env.TOPIC_DEVICE_HEALTH,
  env.TOPIC_LAB_READINGS,
  env.TOPIC_SWEEP_READINGS,
  env.TOPIC_WEATHER,
  env.TOPIC_OPS,
  env.TOPIC_FEED_BATCH,
  env.TOPIC_FEED_QUALITY,
  env.TOPIC_ECON_TXN,
  env.TOPIC_DEVICE_SNAPSHOT,
  env.TOPIC_FARM_SNAPSHOT,
  env.TOPIC_HOUSE_SNAPSHOT,
  env.TOPIC_FLOCK_SNAPSHOT,
];

const topicsInCSV =
  process.env.KAFKA_TOPICS_IN && process.env.KAFKA_TOPICS_IN.trim().length > 0
    ? process.env.KAFKA_TOPICS_IN
    : defaultInputTopics.join(',');

export const inputTopics = listFromCSV(topicsInCSV);
export const topicOut = env.KAFKA_TOPIC_OUT;
export const dlqTopic = env.KAFKA_TOPIC_DLQ;

/** tenant filter */
export const tenantFilterList = env.TENANT_FILTER
  ? listFromCSV(env.TENANT_FILTER)
  : [];

/** DB helpers */
export const db = {
  url: env.DATABASE_URL,
  schema: env.DB_SCHEMA,
  searchPath: `${env.DB_SCHEMA},public`,
};

/** สะดวกเวลาจะ import รายชื่อ topic ทีละตัว */
export const topics = {
  sensors: env.TOPIC_SENSORS,
  deviceHealth: env.TOPIC_DEVICE_HEALTH,
  lab: env.TOPIC_LAB_READINGS,
  sweep: env.TOPIC_SWEEP_READINGS,
  weather: env.TOPIC_WEATHER,
  ops: env.TOPIC_OPS,
  feedBatch: env.TOPIC_FEED_BATCH,
  feedQuality: env.TOPIC_FEED_QUALITY,
  econTxn: env.TOPIC_ECON_TXN,
  deviceSnap: env.TOPIC_DEVICE_SNAPSHOT,
  farmSnap: env.TOPIC_FARM_SNAPSHOT,
  houseSnap: env.TOPIC_HOUSE_SNAPSHOT,
  flockSnap: env.TOPIC_FLOCK_SNAPSHOT,
  features: env.TOPIC_FEATURES,
  predictions: env.TOPIC_PREDICTIONS,
  anomalies: env.TOPIC_ANOMALIES,
};

export const port = env.ANALYTIC_STREAM_PORT;
