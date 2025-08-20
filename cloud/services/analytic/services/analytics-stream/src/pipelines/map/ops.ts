// src/pipelines/map/ops.ts
import { z } from 'zod';
import type { Measurement } from '../../types/measurement';

// --- robust time parser (ISO / epoch sec|ms / "YYYY-MM-DD HH:mm:ss[.SSS]") ---
const Time = z.preprocess((input) => {
  if (input instanceof Date) return input;
  if (typeof input === 'number') {
    const ms = input > 1e12 ? input : input * 1000;
    return new Date(ms);
  }
  if (typeof input === 'string') {
    const s = input.trim();
    if (/^\d{13}$/.test(s)) return new Date(Number(s));               // ms
    if (/^\d{10}$/.test(s)) return new Date(Number(s) * 1000);        // sec
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s)) {
      return new Date(s.replace(' ', 'T') + 'Z');
    }
    const d = new Date(s); if (!Number.isNaN(d.getTime())) return d;
  }
  return input;
}, z.date());

// --- รูปแบบเหตุการณ์ OPS ---
const OpsEvent = z.object({
  schema: z.string().optional(),          // e.g. farms.operational.event.v1
  tenant_id: z.string().min(1),

  // ระบุเอนทิตีใดเอนทิตีหนึ่งอย่างน้อย 1 ตัว
  farm_id:  z.string().optional(),
  house_id: z.string().optional(),
  device_id:z.string().optional(),

  category: z.string().min(1),            // e.g. ventilation, feeding, alarm
  type:     z.string().min(1),            // e.g. fan_speed_change, feed_load

  // เวลา รองรับทั้ง time/ts
  time: Time.optional(),
  ts:   Time.optional(),

  // ค่าที่มากับเหตุการณ์ (อาจไม่มี)
  quantity: z.number().finite().optional(), // ปริมาณ/ตัวเลขของเหตุการณ์
  unit:     z.string().optional(),          // หน่วยสำหรับ quantity

  severity: z.enum(['info','warning','critical']).optional(),
  actor:    z.string().optional(),          // ผู้กระทำ/ระบบ
  meta:     z.record(z.unknown()).optional()
});

function sanitize(x: string) {
  return x.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '_');
}

/**
 * แปลง OPS event → หนึ่งหรือหลาย measurement
 * - สร้าง metric "ops.<category>.<type>.count" = 1 เสมอ
 * - ถ้ามี quantity -> เพิ่ม metric "ops.<category>.<type>.qty" = quantity
 * - เลือก entity id ตามลำดับ: device_id > house_id > farm_id
 */
export function toMeasurementsFromOps(o: any): Measurement[] | null {
  const d = OpsEvent.parse(o);
  const time = (d.time ?? d.ts)!;

  const entity =
    d.device_id ?? d.house_id ?? d.farm_id;
  if (!entity) return null; // ไม่มี entity ให้ผูก → ข้าม

  const base = `ops.${sanitize(d.category)}.${sanitize(d.type)}`;

  const tags: Record<string,string> = {};
  if (d.severity) tags.severity = d.severity;
  if (d.unit)     tags.unit     = d.unit;
  if (d.actor)    tags.actor    = d.actor;
  if (d.farm_id)  tags.farm_id  = d.farm_id;
  if (d.house_id) tags.house_id = d.house_id;
  if (d.device_id)tags.src_device_id = d.device_id; // เก็บ id ต้นทางเพิ่ม

  const out: Measurement[] = [
    {
      tenant_id: d.tenant_id,
      device_id: entity,
      metric: `${base}.count`,
      value: 1,
      time,
      tags
    }
  ];

  if (typeof d.quantity === 'number' && Number.isFinite(d.quantity)) {
    out.push({
      tenant_id: d.tenant_id,
      device_id: entity,
      metric: `${base}.qty`,
      value: d.quantity,
      time,
      tags
    });
  }

  return out;
}
