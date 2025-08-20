// src/types/measurement.ts
import { z } from 'zod';

export const MeasurementSchema = z.object({
  tenant_id: z.string().min(1),
  device_id: z.string().min(1),
  sensor_id: z.string().optional(),     // ✅ เพิ่ม
  metric:    z.string().min(1),
  value:     z.number().finite(),
  time:      z.coerce.date(),
  tags:      z.record(z.string()).optional(),
});

export type Measurement = z.infer<typeof MeasurementSchema>;
export type MeasurementList = Measurement | Measurement[] | null;


