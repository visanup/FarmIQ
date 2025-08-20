// src/pipelines/map/time.ts
import { z } from 'zod';

// รับได้ทั้ง Date, string, number แล้ว normalize เป็น Date
export const normalizeTime = z.union([z.date(), z.string(), z.number()])
  .transform((v) => {
    const d = v instanceof Date ? v : new Date(v);
    if (Number.isNaN(d.getTime())) {
      throw new Error('Invalid time value');
    }
    return d;
  });

// ถ้าต้องการ optional ก็ไป .optional() ตอนใช้งาน
export type NormalizedTime = z.output<typeof normalizeTime>; // => Date
