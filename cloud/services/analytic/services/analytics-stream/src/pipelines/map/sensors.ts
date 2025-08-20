// src/pipelines/map/sensors.ts
import { z } from 'zod';
import { normalizeTime } from './time'; // ✅ ใช้ตัวกลางเดียวกับไฟล์อื่น
import type { Measurement } from '../../types/measurement';

const SensorSchema = z.object({
  tenant_id: z.string().min(1),
  device_id: z.string().min(1),
  sensor_id: z.string().optional(),
  quality: z.string().optional(),
  metric: z.string().min(1),
  value: z.number().finite(),
  time: normalizeTime.optional(),
  ts:   normalizeTime.optional(),
  tags: z.record(z.string()).optional(),
});

export function toMeasurementFromSensor(o: any): Measurement | null {
  const d = SensorSchema.parse(o);
  const time = (d.time ?? d.ts)!;

  const tags: Record<string, string> = { ...(d.tags ?? {}) };
  if (d.sensor_id) tags.sensor_id = d.sensor_id;
  if (d.quality)   tags.quality   = d.quality;

  return {
    tenant_id: d.tenant_id,
    device_id: d.device_id,
    sensor_id: d.sensor_id ?? undefined, // ✅ ใส่เป็นฟิลด์จริง
    metric: d.metric,                    // ✅ ไม่เติม 'sensor.' แล้ว
    value: d.value,
    time,
    tags: Object.keys(tags).length ? tags : undefined,
  };
}


