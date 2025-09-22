// src/pipelines/map/sweep.ts
import { z } from 'zod';
import type { Measurement } from '../../types/measurement';
import { normalizeTime } from './time'; // ✅ ใช้ตัวกลางเดียวกับไฟล์อื่น

const sanitize = (x: string) =>
  x.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '_');

const num = (v: any): number | undefined => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(+v)) return +v;
  if (Array.isArray(v)) return v.length;
  return undefined;
};

/** payload จาก edge (sweep_readings) - รองรับทั้งรูปแบบเก่าและใหม่ */
const SweepReading = z.object({
  // รูปแบบเก่า (flat)
  schema: z.string().optional(),
  tenant_id: z.string().min(1).optional(),
  robot_id: z.string().min(1).optional(),
  run_id: z.union([z.string(), z.number()]).optional(),
  sensor_id: z.string().min(1).optional(),
  metric: z.string().min(1).optional(),
  value: z.union([z.number(), z.string(), z.array(z.any())]).optional(),
  zone_id: z.string().optional(),
  x: z.union([z.number(), z.string()]).optional(),
  y: z.union([z.number(), z.string()]).optional(),
  quality: z.string().optional(),
  payload: z.record(z.unknown()).optional(),
  time: normalizeTime.optional(),
  ts: normalizeTime.optional(),

  // รูปแบบใหม่จาก sensor-streamer-service (envelope)
  eventId: z.string().optional(),
  eventType: z.string().optional(),
  version: z.string().optional(),
  timestamp: normalizeTime.optional(),
  headers: z.record(z.union([z.string(), z.instanceof(Buffer)])).optional(),
  source: z.object({
    service: z.string().optional(),
    version: z.string().optional(),
  }).optional(),
  data: z.object({
    id: z.string().optional(),
    deviceId: z.string().optional(),
    farmId: z.string().optional(),
    sweepId: z.string().optional(),
    data: z.record(z.unknown()).optional(),
    metadata: z.record(z.unknown()).optional(),
    timestamp: normalizeTime.optional(),
    createdAt: normalizeTime.optional(),
    tenantId: z.string().optional(),
  }).optional(),
});

export function toMeasurementFromSweep(o: any): Measurement | null {
  const d = SweepReading.parse(o);

  // -------- รูปแบบใหม่ (envelope) --------
  if (d.data && d.data.deviceId) {
    const meta = (d.data.metadata as any) ?? {};
    const dataBlock = (d.data.data as any) ?? {};

    const tenant_id =
      meta.customerId ??
      d.data.tenantId ??
      d.tenant_id ??
      'unknown';

    const device_id = d.data.deviceId;
    const sensor_id = d.data.id ?? 'sweep-sensor';

    const sweepType = dataBlock.sweepType ? sanitize(String(dataBlock.sweepType)) : 'reading';
    const metric = `sweep.${sweepType}`;

    // เลือก value แบบรักษา 0 และ coerce
    const candidates = [
      dataBlock.qualityScore,
      dataBlock.score,
      dataBlock.readings_count,
      dataBlock.readings,
      dataBlock.anomalies_count,
      dataBlock.anomalies,
      dataBlock.duration,
    ];
    let value: number | undefined;
    for (const c of candidates) {
      const v = num(c);
      if (v !== undefined) { value = v; break; }
    }
    if (value === undefined) value = 0;

    const time =
      d.data.timestamp ??
      d.timestamp ??
      new Date();

    const tags: Record<string, string> = {};
    if (d.data.farmId) tags.farm_id = d.data.farmId;
    if (d.data.sweepId) tags.sweep_id = d.data.sweepId;
    if (dataBlock.sweepType) tags.sweep_type = sweepType;

    const duration = num(dataBlock.duration);
    if (duration !== undefined) tags.duration_s = String(duration);

    const readingsCount = num(dataBlock.readings);
    if (readingsCount !== undefined) tags.readings_count = String(readingsCount);

    const anomaliesCount = num(dataBlock.anomalies);
    if (anomaliesCount !== undefined) tags.anomalies_count = String(anomaliesCount);

    if (meta.farmName)  tags.farm_name  = String(meta.farmName);
    if (meta.houseName) tags.house_name = String(meta.houseName);
    if (meta.operator)  tags.operator   = String(meta.operator);
    if (meta.equipment) tags.equipment  = String(meta.equipment);

    return {
      tenant_id,
      device_id,
      sensor_id,
      metric,
      value,
      time,
      tags,
    };
  }

  // -------- รูปแบบเก่า (flat) --------
  const tenant_id = d.tenant_id;
  const device_id = d.robot_id;
  const sensor_id = d.sensor_id;
  const metric = d.metric ? `sweep.${sanitize(d.metric)}` : undefined;
  const value = num(d.value);
  const time = d.time ?? d.ts ?? new Date();

  if (!tenant_id || !device_id || !sensor_id || !metric || value === undefined) {
    return null;
  }

  const tags: Record<string, string> = {};
  if (d.run_id !== undefined) tags.run_id = String(d.run_id);
  if (sensor_id) tags.sensor_id = sensor_id;
  if (d.zone_id) tags.zone_id = d.zone_id;
  if (d.x !== undefined) tags.x = String(num(d.x) ?? d.x);
  if (d.y !== undefined) tags.y = String(num(d.y) ?? d.y);
  if (d.quality) tags.quality = d.quality;

  return {
    tenant_id,
    device_id,
    sensor_id,
    metric,
    value,
    time,
    tags,
  };
}
