// src/services/sensor.service.ts
import { prisma } from "../util/prisma";

export async function saveSweepReading(r: {
  time: Date; tenantId: string; robotId: string; runId: number; sensorId: string;
  metric: string; zoneId?: string; x?: number; y?: number;
  value: number; quality: "raw"|"clean"|"anomaly"|"dlq"|"invalid"|"calibrating"|"stale"; payload?: any;
}) {
  // Use parameterized SQL to avoid model declarations; targets sensors.sweep_readings
  await prisma.$executeRawUnsafe(
    `INSERT INTO sensors.sweep_readings
      (time, tenant_id, robot_id, run_id, sensor_id, metric, zone_id, x, y, value, quality, payload)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     ON CONFLICT (time, robot_id, run_id, sensor_id, metric)
     DO UPDATE SET zone_id=EXCLUDED.zone_id, x=EXCLUDED.x, y=EXCLUDED.y,
                   value=EXCLUDED.value, quality=EXCLUDED.quality, payload=EXCLUDED.payload`,
    r.time, r.tenantId, r.robotId, r.runId, r.sensorId, r.metric,
    r.zoneId ?? null, r.x ?? null, r.y ?? null, r.value, r.quality, r.payload ?? null
  );
}

export async function upsertDeviceHealth(r: {
  time: Date; tenantId: string; deviceId: string;
  online?: boolean; source?: string; rssi?: number; uptimeS?: number; meta?: any;
}) {
  await prisma.$executeRawUnsafe(
    `INSERT INTO sensors.device_health
      (time, tenant_id, device_id, online, source, rssi, uptime_s, meta)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (time, tenant_id, device_id)
     DO UPDATE SET online=EXCLUDED.online, source=EXCLUDED.source,
                   rssi=EXCLUDED.rssi, uptime_s=EXCLUDED.uptime_s, meta=EXCLUDED.meta`,
    r.time, r.tenantId, r.deviceId, r.online ?? null, r.source ?? null, r.rssi ?? null, r.uptimeS ?? null, r.meta ?? {}
  );
}

// สำหรับอุปกรณ์ทั่วไป (ไม่มี run) → เรียกฟังก์ชัน SQL โดยตรงผ่าน Prisma
export async function ingestDeviceReadingSQL(r: {
  tenantId: string; deviceId: string; time: Date;
  sensorId?: string | null; metric: string; value: number;
  quality: "raw"|"clean"|"anomaly"|"dlq"|"invalid"|"calibrating"|"stale";
  payload?: any;
}) {
  await prisma.$executeRawUnsafe(
    `SELECT sensors.fn_ingest_device_reading(
       $1::text,
       $2::text,
       $3::timestamptz,
       $4::text,
       $5::text,
       $6::double precision,
       $7::sensors.quality_enum,
       $8::jsonb
    )`,
    r.tenantId, r.deviceId, r.time, r.sensorId ?? null, r.metric, r.value, r.quality, r.payload ?? {}
  );
}
