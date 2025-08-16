// src/schemas/ingestion.schemas.ts

import { z } from '../utils/zod';
import type { TypeOf } from 'zod';

/** payload ที่ image-ingestion ควรยิงออกมา */
export const ImageCreatedEvent = z.object({
  event: z.literal('image.created').default('image.created'),
  media_id: z.number().int(),
  time: z.string().datetime(),
  tenant_id: z.string(),
  bucket: z.string(),
  object_key: z.string(),
  station_id: z.string().optional(),
  sensor_id: z.string().optional(),
  meta: z.record(z.any()).optional(),
});
export type ImageCreatedEventT = TypeOf<typeof ImageCreatedEvent>;

/** REST: ขอให้จับคู่ย้อนหลัง */
export const AssociateRequest = z.object({
  media_id: z.number().int().optional(),
  bucket: z.string().optional(),
  object_key: z.string().optional(),
  window_ms: z.number().int().min(100).max(60000).default(5000),
});
export type AssociateRequestT = TypeOf<typeof AssociateRequest>;

export const AssociateResponse = z.object({
  ok: z.boolean(),
  media_id: z.number().int(),
  reading_id: z.number().int(),
  delta_ms: z.number().int(),
  weight: z.number().nullable(),
});




