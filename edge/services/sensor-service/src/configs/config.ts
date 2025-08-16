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

/** ---------- Database ---------- */
export const DB_HOST     = process.env.DB_HOST || 'localhost';
export const DB_PORT     = asNum(process.env.DB_PORT, 5432);
export const DB_NAME     = process.env.DB_NAME || 'edge_db';
export const DB_USER     = process.env.DB_USER || 'postgres';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
export const WRITE_DB    = asBool(process.env.WRITE_DB, false);
export const DATABASE_URL =
  process.env.DATABASE_URL || `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

/** ---------- Server ---------- */
export const PORT = asNum(process.env.SENSOR_PORT ?? process.env.PORT, 6309);

/** ---------- API Key ---------- */
export const SERVICE_API_KEY = process.env.SERVICE_API_KEY ?? process.env.API_KEY ?? '';
export const REQUIRE_API_KEY = asBool(process.env.REQUIRE_API_KEY, false);

/** ---------- MQTT ---------- */
export const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';

// parse จาก URL เพื่อดึง host/port/proto/cred
let urlUser = '', urlPass = '', urlHost = 'localhost', urlPort = 1883, urlProtocol: 'mqtt' | 'mqtts' = 'mqtt';
try {
  const u = new URL(MQTT_BROKER_URL);
  urlProtocol = (u.protocol.replace(':', '') as any) || 'mqtt';
  urlHost = u.hostname || 'localhost';
  urlPort = u.port ? Number(u.port) : (urlProtocol === 'mqtts' ? 8883 : 1883);
  urlUser = u.username ? decodeURIComponent(u.username) : '';
  urlPass = u.password ? decodeURIComponent(u.password) : '';
} catch { /* ignore malformed URL */ }

// ใช้เฉพาะตัวแปรของ “sensor-service” หรือ cred ใน URL เพื่อกันชนกับ service อื่น
export const MQTT_USER =
  pick(process.env.MQTT_SENSOR_USER, urlUser);

export const MQTT_PASSWORD =
  pick(process.env.MQTT_SENSOR_PASSWORD, urlPass);

export const MQTT_PROTOCOL = urlProtocol; // 'mqtt' | 'mqtts'
export const MQTT_HOST = urlHost;
export const MQTT_PORT = urlPort;
export const MQTT_TLS = MQTT_PROTOCOL === 'mqtts';

// topics / namespaces
export const SENSOR_RAW_SUB = process.env.SENSOR_RAW_SUB || 'sensor.raw/+/+/+';
export const PUB_NS_CLEAN   = process.env.PUB_NS_CLEAN || 'sensor.clean';
export const PUB_NS_ANOMALY = process.env.PUB_NS_ANOMALY || 'sensor.anomaly';
export const PUB_NS_DLQ     = process.env.PUB_NS_DLQ || 'sensor.dlq';

// clientId (ถ้าอยากควบคุมจาก env)
export const MQTT_CLIENT_ID = process.env.MQTT_CLIENT_ID || `edge_sensor_svc_${Math.random().toString(16).slice(2, 8)}`;

/** ตัวเลือกสำหรับ mqtt.connect */
export const mqttConnectOptions: any = {
  protocol: MQTT_PROTOCOL,
  host: MQTT_HOST,
  port: MQTT_PORT,
  clientId: MQTT_CLIENT_ID,
  // ใส่เฉพาะเมื่อมีค่าไม่ว่าง
  username: MQTT_USER || undefined,
  password: MQTT_PASSWORD || undefined,
  clean: true,
  keepalive: asNum(process.env.MQTT_KEEPALIVE, 30),
  reconnectPeriod: asNum(process.env.MQTT_RECONNECT_MS, 2000),
  // ถ้าใช้ mqtts และเป็น self-signed:
  rejectUnauthorized: asBool(process.env.MQTT_TLS_REJECT_UNAUTHORIZED, true),
};

