// src/schemas/ingestion.schemas.ts
import { z } from '../utils/zod';
import type { TypeOf } from 'zod';

export const IngestMetaSchema = z.object({
  tenant_id: z.string().min(1),
  metric: z.string().default('image'),
  time: z.string().datetime().optional(),
  robot_id: z.string().optional(),
  run_id: z.union([z.string(), z.number()]).optional()
           .transform(v => (v == null ? undefined : String(v))),
  station_id: z.string().optional(),
  sensor_id: z.string().optional(),
  kind: z.string().default('image'),
});

export const IngestResponseSchema = z.object({
  ok: z.boolean(),
  media_id: z.number().int(),
  object_key: z.string(),
  bucket: z.string(),
});

export const MediaObjectSchema = z.object({
  media_id: z.number().int(),
  time: z.string().datetime(),
  tenant_id: z.string(),
  kind: z.string(),
  bucket: z.string(),
  object_key: z.string(),
  sha256: z.string().nullable().optional(),
  width: z.number().int().nullable().optional(),
  height: z.number().int().nullable().optional(),
  meta: z.record(z.any()).optional(),
});

export type IngestMeta = TypeOf<typeof IngestMetaSchema>;



