// src/pipelines/map/sweep.ts
import { z } from 'zod';
import type { Measurement } from '../../types/measurement';
import { normalizeTime } from './time'; // ✅ ใช้ตัวกลางเดียวกับไฟล์อื่น

/** payload จาก edge (sweep_readings) */
const SweepReading = z.object({
  schema: z.string().optional(),
  tenant_id: z.string().min(1),
  robot_id: z.string().min(1),
  run_id: z.union([z.string(), z.number()]),
  sensor_id: z.string().min(1),
  metric: z.string().min(1),
  value: z.number().finite(),
  zone_id: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  quality: z.string().optional(),
  payload: z.record(z.unknown()).optional(),
  time: normalizeTime.optional(),   // ✅ แทนที่ Time.preprocess เดิม
  ts:   normalizeTime.optional(),
});

export function toMeasurementFromSweep(o: any): Measurement | null {
  const d = SweepReading.parse(o);
  const time = (d.time ?? d.ts)!;

  const tags: Record<string, string> = {
    run_id: String(d.run_id),
    sensor_id: d.sensor_id,
  };
  if (d.zone_id) tags.zone_id = d.zone_id;
  if (typeof d.x === 'number') tags.x = String(d.x);
  if (typeof d.y === 'number') tags.y = String(d.y);
  if (d.quality) tags.quality = d.quality;

  return {
    tenant_id: d.tenant_id,
    device_id: d.robot_id,
    sensor_id: d.sensor_id,                      // ✅ ใส่เป็นฟิลด์จริง (ให้ตรง BaseReading)
    metric: `sweep.${d.metric.toLowerCase()}`,
    value: d.value,
    time,
    tags,
  };
}



