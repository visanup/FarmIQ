// src/utils/zod.ts

import { z } from "zod";

export const RawReadingSchema = z.object({
  ts: z.coerce.date().optional(),
  value: z.coerce.number(),
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

// DQ ตัวอย่างเบสไลน์
export function applyDQ(metric: string, value: number): { quality: "clean" | "anomaly" | "dlq"; reasons?: string[] } {
  if (!Number.isFinite(value)) return { quality: "dlq", reasons: ["not_finite"] };
  // range เบื้องต้นต่อ metric
  const ranges: Record<string, [number, number]> = {
    TEMP: [-40, 120],
    HUMID: [0, 100],
    CO2: [0, 50000],
    NH3: [0, 200],
    TVOC: [0, 5000],
    WEIGHT: [0, 100000],
  };
  const [lo, hi] = ranges[metric] || [-1e12, 1e12];
  if (value < lo || value > hi) return { quality: "anomaly", reasons: ["out_of_range"] };
  return { quality: "clean" };
}
