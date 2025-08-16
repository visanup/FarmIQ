// src/services/sensor.service.ts
import { AppDataSource } from "../utils/dataSource";
import { SweepReading } from "../models/SweepReading";
import { DeviceHealth } from "../models/DeviceHealth";

export async function saveSweepReading(r: {
  time: Date; tenantId: string; robotId: string; runId: number; sensorId: string;
  metric: string; zoneId?: string; x?: number; y?: number;
  value: number; quality: SweepReading["quality"]; payload?: any;
}) {
  const repo = AppDataSource.getRepository(SweepReading);
  return repo.save(repo.create(r));
}

export async function upsertDeviceHealth(r: {
  time: Date; tenantId: string; deviceId: string;
  online?: boolean; source?: string; rssi?: number; uptimeS?: number; meta?: any;
}) {
  const repo = AppDataSource.getRepository(DeviceHealth);
  return repo.save(repo.create(r));
}

// สำหรับอุปกรณ์ทั่วไป (ไม่มี run) → ใช้ฟังก์ชัน SQL เพื่อหลบ PK/COALESCE
export async function ingestDeviceReadingSQL(r: {
  tenantId: string; deviceId: string; time: Date;
  sensorId?: string | null; metric: string; value: number;
  quality: "raw"|"clean"|"anomaly"|"dlq"|"invalid"|"calibrating"|"stale";
  payload?: any;
}) {
  return AppDataSource.query(
    `SELECT sensors.fn_ingest_device_reading($1,$2,$3,$4,$5,$6,$7,$8)`,
    [r.tenantId, r.deviceId, r.time, r.sensorId ?? null, r.metric, r.value, r.quality, r.payload ?? {}]
  );
}
