// src/types/events.ts

import { z } from 'zod';

// ตัวแปลงเวลาแบบ robust
const TimeSchema = z.preprocess((input) => {
  if (input instanceof Date) return input;
  if (typeof input === 'number') {
    const ms = input > 1e12 ? input : input * 1000;
    return new Date(ms);
  }
  if (typeof input === 'string') {
    const s = input.trim();
    if (/^\d{13}$/.test(s)) return new Date(Number(s));        // ms
    if (/^\d{10}$/.test(s)) return new Date(Number(s) * 1000); // sec
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s)) {
      return new Date(s.replace(' ', 'T') + 'Z');
    }
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return input;
}, z.date());

// รับได้ทั้ง time/ts แล้ว normalize เป็น time
const BaseReadingRaw = z.object({
  tenant_id: z.string().min(1),
  device_id: z.string().min(1),
  sensor_id: z.string().optional(),
  metric: z.string().min(1),
  value: z.number().finite(),
  time: TimeSchema.optional(),
  ts: TimeSchema.optional(),                 // 👈 รองรับฟิลด์นี้เพิ่ม
  tags: z.record(z.string()).optional(),
});

export const BaseReadingSchema = BaseReadingRaw
  .refine(d => !!(d.time ?? d.ts), { path: ['time'], message: 'Required' })
  .transform(d => ({
    tenant_id: d.tenant_id,
    device_id: d.device_id,
    sensor_id: d.sensor_id,
    metric: d.metric,
    value: d.value,
    time: (d.time ?? d.ts)!,                 // 👈 map มาเป็น time เสมอ
    tags: d.tags
  }));

export type BaseReading = z.infer<typeof BaseReadingSchema>;


