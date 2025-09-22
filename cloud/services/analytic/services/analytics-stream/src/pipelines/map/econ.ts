// src/pipelines/map/econ.ts
import { z } from 'zod';
import type { Measurement } from '../../types/measurement';

/** ---------- Robust time parser (ISO / epoch sec|ms / 'YYYY-MM-DD HH:mm:ss[.SSS]') ---------- */
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
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s))
      return new Date(s.replace(' ', 'T') + 'Z');
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return input;
}, z.date());

const sanitize = (x: string) =>
  x.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '_');

const toUpper = (s?: string) => (s ? s.toUpperCase() : s);

/** ---------- สคีมาข้อมูลธุรกรรมต้นทาง ---------- */
const EconTxn = z.object({
  schema: z.string().optional(),       // "economics.cost.txn.v1"
  tenant_id: z.string().min(1),

  // anchors (เลือกอย่างน้อย 1)
  farm_id: z.string().optional(),
  house_id: z.string().optional(),
  cost_center: z.string().optional(),  // e.g. "house-03" / "farm-01" / "office"
  device_id: z.string().optional(),

  // เนื้อธุรกรรม
  category: z.string().min(1),         // e.g. "feed", "labor", "utilities", "medicine"
  subcategory: z.string().optional(),  // e.g. "grower", "electricity"
  item_code: z.string().optional(),
  description: z.string().optional(),

  amount: z.coerce.number().finite().optional(),     // ✅ รับ string/number
  currency: z.string().optional(),                   // e.g. "THB", "USD"

  quantity: z.coerce.number().finite().optional(),   // ✅ รับ string/number
  unit: z.string().optional(),                       // e.g. "kg", "h", "kWh"

  // (ออปชัน) การแปลงสกุลเงิน → base
  base_currency: z.string().optional(),              // e.g. "THB"
  rate_to_base: z.coerce.number().finite().optional(), // ✅ รับ string/number

  vendor_id: z.string().optional(),
  invoice_id: z.string().optional(),

  // เวลา
  time: Time.optional(),
  ts:   Time.optional(),

  meta: z.record(z.unknown()).optional()
}).refine(d => !!(d.time ?? d.ts), { path: ['time'], message: 'Required' });

/**
 * แปลงธุรกรรมเศรษฐศาสตร์ → ชุด measurement:
 *   - econ.txn.count = 1
 *   - econ.txn.amount (tags.currency)
 *   - econ.txn.amount_base (ถ้ามี base_currency + rate_to_base)
 *   - econ.txn.qty (tags.unit)
 *   - econ.txn.ppu / ppu_base (price per unit)
 *   - econ.category.<cat>.amount / .qty / .ppu (+ เวอร์ชัน *_base)
 *
 * entity anchor: house_id > farm_id > cost_center > device_id
 */
export function toMeasurementsFromEconTxn(o: any): Measurement[] | null {
  const d = EconTxn.parse(o);
  const time = (d.time ?? d.ts)!;

  const entity = d.house_id ?? d.farm_id ?? d.cost_center ?? d.device_id;
  if (!entity) return null; // ไม่มี anchor ให้ผูก → ข้าม

  const cat = sanitize(d.category);
  const currency = toUpper(d.currency);
  const baseCurrency = toUpper(d.base_currency);

  const tags: Record<string, string> = {};
  if (d.subcategory) tags.subcat = sanitize(d.subcategory);
  if (currency)      tags.currency = currency;
  if (d.unit)        tags.unit = d.unit;
  if (d.vendor_id)   tags.vendor_id = d.vendor_id;
  if (d.invoice_id)  tags.invoice_id = d.invoice_id;
  if (d.farm_id)     tags.farm_id = d.farm_id!;
  if (d.house_id)    tags.house_id = d.house_id!;
  if (d.cost_center) tags.cost_center = d.cost_center!;
  if (d.item_code)   tags.item_code = d.item_code!;

  const out: Measurement[] = [
    {
      tenant_id: d.tenant_id,
      device_id: entity,
      metric: 'econ.txn.count',
      value: 1,
      time,
      tags
    }
  ];

  // amount + category amount
  if (typeof d.amount === 'number' && Number.isFinite(d.amount)) {
    out.push({
      tenant_id: d.tenant_id,
      device_id: entity,
      metric: 'econ.txn.amount',
      value: d.amount,
      time,
      tags
    });
    out.push({
      tenant_id: d.tenant_id,
      device_id: entity,
      metric: `econ.category.${cat}.amount`,
      value: d.amount,
      time,
      tags
    });

    // amount_base / category.amount_base
    if (baseCurrency && typeof d.rate_to_base === 'number' && Number.isFinite(d.rate_to_base)) {
      const amountBase = d.amount * d.rate_to_base;
      const tagsBase = { ...tags, currency: baseCurrency, fx_rate: String(d.rate_to_base) };

      out.push({
        tenant_id: d.tenant_id,
        device_id: entity,
        metric: 'econ.txn.amount_base',
        value: amountBase,
        time,
        tags: tagsBase
      });
      out.push({
        tenant_id: d.tenant_id,
        device_id: entity,
        metric: `econ.category.${cat}.amount_base`,
        value: amountBase,
        time,
        tags: tagsBase
      });
    }
  }

  // qty + category qty
  if (typeof d.quantity === 'number' && Number.isFinite(d.quantity)) {
    out.push({
      tenant_id: d.tenant_id,
      device_id: entity,
      metric: 'econ.txn.qty',
      value: d.quantity,
      time,
      tags
    });
    out.push({
      tenant_id: d.tenant_id,
      device_id: entity,
      metric: `econ.category.${cat}.qty`,
      value: d.quantity,
      time,
      tags
    });

    // price per unit
    if (typeof d.amount === 'number' && Number.isFinite(d.amount) && d.quantity !== 0) {
      const ppu = d.amount / d.quantity;
      out.push({
        tenant_id: d.tenant_id,
        device_id: entity,
        metric: 'econ.txn.ppu', // price per unit
        value: ppu,
        time,
        tags
      });
      out.push({
        tenant_id: d.tenant_id,
        device_id: entity,
        metric: `econ.category.${cat}.ppu`,
        value: ppu,
        time,
        tags
      });

      // ppu_base ถ้ามีการแปลงสกุลเงิน
      if (baseCurrency && typeof d.rate_to_base === 'number' && Number.isFinite(d.rate_to_base)) {
        const ppuBase = ppu * d.rate_to_base;
        const tagsBase = { ...tags, currency: baseCurrency, fx_rate: String(d.rate_to_base) };

        out.push({
          tenant_id: d.tenant_id,
          device_id: entity,
          metric: 'econ.txn.ppu_base',
          value: ppuBase,
          time,
          tags: tagsBase
        });
        out.push({
          tenant_id: d.tenant_id,
          device_id: entity,
          metric: `econ.category.${cat}.ppu_base`,
          value: ppuBase,
          time,
          tags: tagsBase
        });
      }
    }
  }

  return out.length ? out : null;
}
