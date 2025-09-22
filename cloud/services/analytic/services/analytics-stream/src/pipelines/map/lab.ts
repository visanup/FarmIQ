// src/pipelines/map/lab.ts
import { z } from 'zod';
import type { Measurement } from '../../types/measurement';
import { normalizeTime } from './time';

// ป้องกัน lab.lab.* และ normalize lower-case
function ensureMetric(raw?: string): string {
  const m = (raw ?? 'reading').trim().toLowerCase();
  return m.startsWith('lab.') ? m : `lab.${m}`;
}

// ถ้าต้องการ map แบบ canonical ต่อชนิด test ให้เพิ่มที่นี่
const METRIC_MAP: Record<string, string> = {
  feed_analysis: 'lab.feed_analysis.mg_per_kg',
  // moisture: 'lab.moisture.percent',
  // protein: 'lab.protein.percent',
};

const LabReading = z.object({
  schema: z.string().optional(),
  tenant_id: z.string().min(1),

  // ยอมรับอย่างใดอย่างหนึ่ง
  station_id: z.string().min(1).optional(),
  device_id: z.string().min(1).optional(),

  sensor_id: z.string().min(1),
  metric: z.string().min(1),

  // รับได้ทั้ง number และ string → บังคับเป็น number
  value: z.coerce.number().finite(),

  quality: z.string().optional(),
  payload: z.record(z.unknown()).optional(),
  time: normalizeTime.optional(),
  ts: normalizeTime.optional(),
})
.refine((d) => !!(d.station_id || d.device_id), {
  path: ['station_id'],
  message: 'station_id or device_id is required',
});

export function toMeasurementFromLab(o: any): Measurement | null {
  // --- 1) Envelope จาก sensor-streamer-service ---
  if (o && typeof o === 'object' && 'data' in o) {
    const data = (o as any).data ?? {};
    const meta = data.metadata ?? {};
    const headers = (o as any).headers ?? {};

    // หา tenant จาก data → metadata → header
    const tenant_id: string =
      data.tenantId ??
      data.tenant_id ??
      meta.customerId ??
      headers['x-tenant-id'] ??
      headers['x-tenant'] ??
      'unknown';

    // station/device fallback: ใช้ station เป็น logical device
    const device_id: string =
      data.stationId ??
      data.deviceId ??
      data.farmId ??
      'unknown';

    const sensor_id: string =
      data.sensorId ??
      data.testType ??
      'lab-sensor';

    // metric: ใช้ data.metric ก่อน, ถ้าไม่มี map จาก testType, ไม่งั้น ensureMetric จาก testType
    const metric = ensureMetric(
      data.metric ??
      METRIC_MAP[(data.testType ?? '').toLowerCase()] ??
      data.testType
    );

    const valueNum = typeof data.value === 'number'
      ? data.value
      : Number.parseFloat(String(data.value ?? 'NaN'));

    if (!Number.isFinite(valueNum)) {
      throw new Error('Invalid lab value (not a finite number)');
    }

    const time =
      (data.timestamp && new Date(data.timestamp)) ||
      ((o as any).timestamp && new Date((o as any).timestamp)) ||
      new Date();

    const tags: Record<string, string> = {};
    if (data.sampleId) tags.sample_id = String(data.sampleId);
    if (data.farmId) tags.farm_id = String(data.farmId);
    if (data.testType) tags.test_type = String(data.testType);
    if (data.result) tags.result = String(data.result);
    if (data.unit) tags.unit = String(data.unit);
    if (meta.customerId) tags.customer_id = String(meta.customerId);
    if (meta.day !== undefined) tags.day = String(meta.day);
    if (meta.reading !== undefined) tags.reading = String(meta.reading);

    return {
      tenant_id,
      device_id,
      sensor_id,
      metric,
      value: valueNum,
      time,
      tags,
    };
  }

  // --- 2) Flat record (เดิม) ---
  const d = LabReading.parse(o);
  const time =
    d.time ??
    d.ts ??
    ((o as any)?.timestamp ? new Date((o as any).timestamp) : new Date());

  const metric = ensureMetric(d.metric);

  return {
    tenant_id: d.tenant_id,
    device_id: d.station_id ?? d.device_id!, // อย่างน้อยต้องมีหนึ่ง (refine บังคับไว้แล้ว)
    sensor_id: d.sensor_id,
    metric,
    value: d.value,
    time,
    tags: d.quality ? { quality: d.quality } : undefined,
  };
}
