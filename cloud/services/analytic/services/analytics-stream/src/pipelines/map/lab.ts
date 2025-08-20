// src/pipelines/map/lab.ts
import { z } from 'zod';
import type { Measurement } from '../../types/measurement';
import { normalizeTime } from './time'; // ✅ ใช้ parser กลาง

const LabReading = z.object({
  schema: z.string().optional(),
  tenant_id: z.string().min(1),
  station_id: z.string().min(1),
  sensor_id: z.string().min(1),
  metric: z.string().min(1),
  value: z.number().finite(),
  quality: z.string().optional(),
  payload: z.record(z.unknown()).optional(),
  time: normalizeTime.optional(),  // ✅ แทน Time.preprocess
  ts:   normalizeTime.optional(),
});

export function toMeasurementFromLab(o: any): Measurement | null {
  const d = LabReading.parse(o);
  const time = (d.time ?? d.ts)!;

  return {
    tenant_id: d.tenant_id,
    device_id: d.station_id,
    sensor_id: d.sensor_id,                     // ✅ ฟิลด์จริง (ให้ตรงกับ BaseReading)
    metric: `lab.${d.metric.toLowerCase()}`,
    value: d.value,
    time,
    tags: d.quality ? { quality: d.quality } : undefined,
  };
}
