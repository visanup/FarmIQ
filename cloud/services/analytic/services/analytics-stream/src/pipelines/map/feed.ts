// src/pipelines/map/feed.ts
import { z } from 'zod';
import type { Measurement } from '../../types/measurement';

/* ---------- Robust time parser (ISO / epoch sec|ms / 'YYYY-MM-DD HH:mm:ss[.SSS]') ---------- */
const Time = z.preprocess((input) => {
  if (input instanceof Date) return input;

  if (typeof input === 'number') {
    const ms = input > 1e12 ? input : input * 1000;
    return new Date(ms);
  }

  if (typeof input === 'string') {
    const s = input.trim();
    if (/^\d{13}$/.test(s)) return new Date(Number(s));        // epoch ms
    if (/^\d{10}$/.test(s)) return new Date(Number(s) * 1000); // epoch sec
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s)) {
      return new Date(s.replace(' ', 'T') + 'Z');               // 'YYYY-MM-DD HH:mm:ss(.SSS)'
    }
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return input;
}, z.date());

const sanitize = (x: string) =>
  x.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '_');

/* ------------------------------------------------------------------------------------------------
 * 1) FEED BATCH  (topic: feed.batch.created.v1)
 *    - สร้าง count เสมอ
 *    - ถ้ามี mass_kg → สร้าง metric ปริมาณด้วย
 *    - entity priority: silo_id > house_id > device_id > farm_id
 * ----------------------------------------------------------------------------------------------*/

const FeedBatchSchema = z.object({
  schema: z.string().optional(), // "feed.batch.created.v1"
  tenant_id: z.string().min(1),

  batch_id: z.string().min(1),
  feed_type: z.string().optional(),
  mass_kg: z.number().finite().optional(),

  farm_id: z.string().optional(),
  house_id: z.string().optional(),
  silo_id: z.string().optional(),
  device_id: z.string().optional(),

  time: Time.optional(),
  ts:   Time.optional(),

  meta: z.record(z.unknown()).optional()
}).refine(d => !!(d.time ?? d.ts), { path: ['time'], message: 'Required' });

export function toMeasurementsFromFeedBatch(o: any): Measurement[] | null {
  const d = FeedBatchSchema.parse(o);
  const time = (d.time ?? d.ts)!;

  const entity = d.silo_id ?? d.house_id ?? d.device_id ?? d.farm_id;
  if (!entity) return null;

  const tags: Record<string, string> = {
    batch_id: d.batch_id
  };
  if (d.feed_type) tags.feed_type = sanitize(d.feed_type);
  if (d.farm_id)   tags.farm_id   = d.farm_id;
  if (d.house_id)  tags.house_id  = d.house_id;
  if (d.silo_id)   tags.silo_id   = d.silo_id;

  const out: Measurement[] = [
    {
      tenant_id: d.tenant_id,
      device_id: entity,
      metric: 'feed.batch.count',
      value: 1,
      time,
      tags
    }
  ];

  if (typeof d.mass_kg === 'number' && Number.isFinite(d.mass_kg)) {
    out.push({
      tenant_id: d.tenant_id,
      device_id: entity,
      metric: 'feed.batch.mass_kg',
      value: d.mass_kg,
      time,
      tags: { ...tags, unit: 'kg' }
    });
  }

  return out;
}

/* ------------------------------------------------------------------------------------------------
 * 2) FEED QUALITY (topic: feed.quality.result.v1)
 *    - แปลงทุก field เชิงตัวเลขที่พบเป็น metric ภายใต้ 'feed.quality.*'
 *    - entity priority: silo_id > house_id > device_id > farm_id
 *    - ตัวอย่างฟิลด์ที่รองรับ: moisture_pct, protein_pct, energy_mjkg, aflatoxin_ppb, fat_pct, fiber_pct ...
 * ----------------------------------------------------------------------------------------------*/

const FeedQualitySchema = z.object({
  schema: z.string().optional(), // "feed.quality.result.v1"
  tenant_id: z.string().min(1),

  batch_id: z.string().optional(),
  status: z.enum(['pass','fail']).optional(),

  // entity anchors
  farm_id: z.string().optional(),
  house_id: z.string().optional(),
  silo_id: z.string().optional(),
  device_id: z.string().optional(),

  time: Time.optional(),
  ts:   Time.optional(),

  // ค่าคุณภาพ (ใส่ optional ไว้หลายตัว—เจอตัวไหน map ตัวนั้น)
  moisture_pct: z.number().finite().optional(),
  protein_pct:  z.number().finite().optional(),
  fat_pct:      z.number().finite().optional(),
  fiber_pct:    z.number().finite().optional(),
  ash_pct:      z.number().finite().optional(),
  salt_pct:     z.number().finite().optional(),
  energy_mjkg:  z.number().finite().optional(),
  aflatoxin_ppb:z.number().finite().optional(),

  // เผื่อขยาย
  meta: z.record(z.unknown()).optional()
}).refine(d => !!(d.time ?? d.ts), { path: ['time'], message: 'Required' });

const QUALITY_MAP: Record<string, { metric: string; unit?: string }> = {
  moisture_pct:   { metric: 'feed.quality.moisture_pct',   unit: 'pct' },
  protein_pct:    { metric: 'feed.quality.protein_pct',    unit: 'pct' },
  fat_pct:        { metric: 'feed.quality.fat_pct',        unit: 'pct' },
  fiber_pct:      { metric: 'feed.quality.fiber_pct',      unit: 'pct' },
  ash_pct:        { metric: 'feed.quality.ash_pct',        unit: 'pct' },
  salt_pct:       { metric: 'feed.quality.salt_pct',       unit: 'pct' },
  energy_mjkg:    { metric: 'feed.quality.energy_mjkg',    unit: 'mjkg' },
  aflatoxin_ppb:  { metric: 'feed.quality.aflatoxin_ppb',  unit: 'ppb' },
};

export function toMeasurementsFromFeedQuality(o: any): Measurement[] | null {
  const d = FeedQualitySchema.parse(o);
  const time = (d.time ?? d.ts)!;

  const entity = d.silo_id ?? d.house_id ?? d.device_id ?? d.farm_id;
  if (!entity) return null;

  const tags: Record<string, string> = {};
  if (d.batch_id) tags.batch_id = d.batch_id;
  if (d.status)   tags.status   = d.status;
  if (d.farm_id)  tags.farm_id  = d.farm_id;
  if (d.house_id) tags.house_id = d.house_id;
  if (d.silo_id)  tags.silo_id  = d.silo_id;

  const out: Measurement[] = [];

  // นำทุกฟิลด์ตัวเลขที่มีอยู่จริงมาแปลงเป็น measurement
  for (const [field, meta] of Object.entries(QUALITY_MAP)) {
    const val = (d as any)[field];
    if (typeof val === 'number' && Number.isFinite(val)) {
      out.push({
        tenant_id: d.tenant_id,
        device_id: entity,
        metric: meta.metric,
        value: val,
        time,
        tags: meta.unit ? { ...tags, unit: meta.unit } : tags
      });
    }
  }

  // เพิ่ม count ของผลทดสอบ 1 ครั้ง (ช่วยนับจำนวน sample ต่อช่วงเวลา)
  out.push({
    tenant_id: d.tenant_id,
    device_id: entity,
    metric: 'feed.quality.sample.count',
    value: 1,
    time,
    tags
  });

  // สถานะ pass/fail เป็น metric แบบบูลีนได้เหมือนกัน (optional)
  if (d.status) {
    out.push({
      tenant_id: d.tenant_id,
      device_id: entity,
      metric: 'feed.quality.pass',
      value: d.status === 'pass' ? 1 : 0,
      time,
      tags
    });
  }

  return out.length ? out : null;
}
