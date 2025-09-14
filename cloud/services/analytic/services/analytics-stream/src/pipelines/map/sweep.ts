// src/pipelines/map/sweep.ts
import { z } from 'zod';
import type { Measurement } from '../../types/measurement';
import { normalizeTime } from './time'; // ✅ ใช้ตัวกลางเดียวกับไฟล์อื่น

/** payload จาก edge (sweep_readings) - รองรับทั้งรูปแบบเก่าและใหม่ */
const SweepReading = z.object({
  schema: z.string().optional(),
  tenant_id: z.string().min(1).optional(),
  robot_id: z.string().min(1).optional(),
  run_id: z.union([z.string(), z.number()]).optional(),
  sensor_id: z.string().min(1).optional(),
  metric: z.string().min(1).optional(),
  value: z.number().finite().optional(),
  zone_id: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  quality: z.string().optional(),
  payload: z.record(z.unknown()).optional(),
  time: normalizeTime.optional(),
  ts: normalizeTime.optional(),
  
  // รองรับรูปแบบใหม่จาก sensor-streamer-service
  eventId: z.string().optional(),
  eventType: z.string().optional(),
  version: z.string().optional(),
  timestamp: normalizeTime.optional(),
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
  }).optional(),
});

export function toMeasurementFromSweep(o: any): Measurement | null {
  const d = SweepReading.parse(o);
  
  // รองรับทั้งรูปแบบเก่าและใหม่
  let tenant_id: string;
  let device_id: string;
  let sensor_id: string;
  let metric: string;
  let value: number;
  let time: Date;
  let tags: Record<string, string> = {};

  // รูปแบบใหม่จาก sensor-streamer-service
  if (d.data && d.data.deviceId) {
    tenant_id = (d.data.metadata as any)?.customerId || 'unknown';
    device_id = d.data.deviceId;
    sensor_id = d.data.id || 'sweep-sensor';
    metric = `sweep.${(d.data.data as any)?.sweepType || 'reading'}`;
    value = (d.data.data as any)?.qualityScore || (d.data.data as any)?.readings || 0;
    time = d.data.timestamp || d.timestamp || new Date();
    
    // สร้าง tags จาก metadata
    if (d.data.metadata) {
      tags.farm_id = d.data.farmId || '';
      tags.farm_name = (d.data.metadata as any).farmName || '';
      tags.house_name = (d.data.metadata as any).houseName || '';
      tags.operator = (d.data.metadata as any).operator || '';
      tags.equipment = (d.data.metadata as any).equipment || '';
      tags.sweep_id = d.data.sweepId || '';
      tags.sweep_type = (d.data.data as any)?.sweepType || '';
      tags.duration = String((d.data.data as any)?.duration || 0);
      tags.readings_count = String((d.data.data as any)?.readings || 0);
      tags.anomalies_count = String((d.data.data as any)?.anomalies || 0);
    }
  } else {
    // รูปแบบเก่า
    if (!d.tenant_id || !d.robot_id || !d.sensor_id || !d.metric || d.value === undefined) {
      return null;
    }
    
    tenant_id = d.tenant_id;
    device_id = d.robot_id;
    sensor_id = d.sensor_id;
    metric = `sweep.${d.metric.toLowerCase()}`;
    value = d.value;
    time = d.time ?? d.ts ?? new Date();
    
    tags.run_id = String(d.run_id || '');
    tags.sensor_id = d.sensor_id;
    if (d.zone_id) tags.zone_id = d.zone_id;
    if (typeof d.x === 'number') tags.x = String(d.x);
    if (typeof d.y === 'number') tags.y = String(d.y);
    if (d.quality) tags.quality = d.quality;
  }

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



