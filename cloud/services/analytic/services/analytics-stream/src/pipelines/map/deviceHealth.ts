// src/pipelines/map/deviceHealth.ts

import { z } from 'zod';
import { normalizeTime } from './time';
import type { Measurement } from '../../types/measurement';

const HealthSchema = z.object({
  tenant_id: z.string(), device_id: z.string(),
  status: z.enum(['up','down','degraded']),
  time: normalizeTime
});

export function toMeasurementFromHealth(o:any): Measurement | null {
  const d = HealthSchema.parse(o);
  const value = d.status === 'up' ? 1 : 0;  // ตัวอย่าง: uptime ratio
  return {
    tenant_id: d.tenant_id,
    device_id: d.device_id,
    metric: 'device.health.up',
    value,
    time: d.time
  };
}
