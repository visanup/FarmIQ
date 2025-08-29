// src/utils/zod.ts
import { z } from "zod";

// sensor reading (raw) - Updated to handle Arduino format
export const RawReadingSchema = z.object({
  ts: z.coerce.date().optional(),
  value: z.coerce.number(),
  unit: z.string().optional(), // Arduino sends unit: "C"
  temp: z.coerce.number().optional(), // Alternative field name
  temperature: z.coerce.number().optional(), // Alternative field name
  // run-context (robot)
  run_id: z.coerce.number().int().positive().optional(),
  sensor_id: z.string().min(1).optional(),
  zone_id: z.string().min(1).optional(),
  x: z.coerce.number().optional(),
  y: z.coerce.number().optional(),
  // Arduino metadata
  meta: z.object({
    device_id: z.string().optional(),
  }).optional(),
}).passthrough();

export type RawReading = z.infer<typeof RawReadingSchema>;

export function parseRaw(buf: Buffer) {
  try {
    const o = JSON.parse(buf.toString("utf8"));
    return RawReadingSchema.parse(o);
  } catch (e) {
    console.error("❌ Invalid raw payload:", e);
    return null;
  }
}

// device health / lwt
export const HealthSchema = z.object({
  ts: z.coerce.date().optional(),
  online: z.boolean().optional(), // health อาจไม่มี online ชัด ๆ ก็ได้
  rssi: z.number().int().optional(),
  uptime_s: z.coerce.number().optional(),
  temp_c: z.number().optional(),
  meta: z.record(z.any()).optional(),
}).passthrough();

export type HealthPayload = z.infer<typeof HealthSchema>;

export function parseHealth(buf: Buffer) {
  try {
    const o = JSON.parse(buf.toString("utf8"));
    return HealthSchema.parse(o);
  } catch (e) {
    console.error("❌ Invalid health payload:", e);
    return null;
  }
}

// DQ baseline
export function applyDQ(metric: string, value: number): { quality: "clean" | "anomaly" | "dlq"; reasons?: string[] } {
  if (!Number.isFinite(value)) return { quality: "dlq", reasons: ["not_finite"] };
  
  // Normalize metric names for validation
  const normalizedMetric = metric.toUpperCase();
  
  const ranges: Record<string, [number, number]> = {
    TEMP: [-50, 120], 
    THERMO: [-50, 120],  // Support for your Arduino "thermo" metric
    TEMPERATURE: [-50, 120],
    HUMID: [0, 100], 
    HUMIDITY: [0, 100],
    CO2: [0, 50000],
    NH3: [0, 200], 
    TVOC: [0, 5000], 
    WEIGHT: [0, 100000],
  };
  
  const [lo, hi] = ranges[normalizedMetric] || [-1e12, 1e12];
  if (value < lo || value > hi) return { quality: "anomaly", reasons: ["out_of_range"] };
  return { quality: "clean" };
}
