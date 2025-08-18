// src/schemas/orchestrator.schemas.ts

import { z } from '../utils/zod';

/* =========================================
 *  Common helpers
 * ========================================= */
export const S3UriSchema = z.string().regex(/^s3:\/\//, 'must start with s3://');

const approxEqualOne = (v: number) => Math.abs(v - 1) < 1e-6;

/* =========================================
 *  Ingest (เดิม)
 * ========================================= */
export const IngestMetaSchema = z.object({
  tenant_id: z.string().min(1),
  metric: z.string().default('image'),
  time: z.string().datetime().optional(),
  robot_id: z.string().optional(),
  run_id: z.union([z.string(), z.number()])
    .optional()
    .transform(v => (v == null ? undefined : String(v))),
  station_id: z.string().optional(),
  sensor_id: z.string().optional(),
  kind: z.string().default('image'),
}).openapi('IngestMeta');

export const IngestResponseSchema = z.object({
  ok: z.boolean(),
  // NOTE: ถ้า DB ใช้ UUID: เปลี่ยนเป็น z.string().uuid()
  media_id: z.number().int(),
  object_key: z.string(),
  bucket: z.string(),
}).openapi('IngestResponse');

export const MediaObjectSchema = z.object({
  // NOTE: ถ้าเป็น UUID: z.string().uuid()
  media_id: z.number().int(),
  time: z.string().datetime(),
  tenant_id: z.string(),
  kind: z.string(),
  bucket: z.string(),
  object_key: z.string(),
  sha256: z.string().nullable().optional(),
  width: z.number().int().nullable().optional(),
  height: z.number().int().nullable().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
}).openapi('MediaObject');

/* =========================================
 *  Datasets (เดิม)
 * ========================================= */
const SplitRawSchema = z.object({
  train: z.number().min(0).max(1).default(0.8),
  val:   z.number().min(0).max(1).default(0.1),
  test:  z.number().min(0).max(1).default(0.1),
})
  // อนุญาตส่งมาไม่ครบ/หรือไม่ส่งเลย
  .partial()
  .transform(s => ({
    train: s.train ?? 0.8,
    val:   s.val   ?? 0.1,
    test:  s.test  ?? 0.1,
  }))
  .superRefine((s, ctx) => {
    const sum = s.train + s.val + s.test;
    if (!approxEqualOne(sum)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `train+val+test must equal 1 (got ${sum})`,
        path: [],
      });
    }
  });

export const BuildDatasetRequestSchema = z.object({
  limit: z.number().int().min(1).max(50000).default(5000),
  split: SplitRawSchema.optional(),
}).openapi('BuildDatasetRequest');

export const BuildDatasetResponseSchema = z.object({
  dataset_s3: S3UriSchema,
  rows: z.number().int().min(0),
}).openapi('BuildDatasetResponse');

export const DatasetExportSchema = z.object({
  id: z.string().uuid(),
  dataset_s3: S3UriSchema,
  rows: z.number().int().min(0),
  meta_json: z.record(z.string(), z.unknown()).optional(),
  created_at: z.string().datetime(),
}).openapi('DatasetExport');

/* =========================================
 *  Models.register (เดิม)
 * ========================================= */
export const ModelRegisterRequestSchema = z.object({
  model_name: z.string().min(1),
  version: z.string().min(1),
  artifact_s3: S3UriSchema,
  metrics: z.record(z.string(), z.unknown()).optional(),
  // .default() เพียงพอ ไม่ต้อง .optional() ซ้ำ
  auto_deploy: z.boolean().default(true),
}).openapi('ModelRegisterRequest');

export const ModelRegisterResponseSchema = z.object({
  id: z.string().uuid(),
  model_name: z.string(),
  version: z.string(),
}).openapi('ModelRegisterResponse');

/* =========================================
 *  Infer.backfill (เดิม)
 * ========================================= */
export const BackfillRequestSchema = z.object({
  object_keys: z.array(z.string()).nonempty(),
}).openapi('BackfillRequest');

/* =========================================
 *  Streamer (ใหม่ สำหรับ sensor-streamer-service)
 * ========================================= */

// ตารางที่ stream ออกไป
export const StreamSourceEnum = z.enum([
  'sensors.device_readings',
  'sensors.device_health',
  'sensors.lab_readings',
  'sensors.sweep_readings',
]).openapi('StreamSource');

// แถวใน stream_state
export const StreamCursorSchema = z.object({
  table_name: StreamSourceEnum,
  last_ts: z.string().datetime(),
  last_key: z.record(z.string(), z.unknown()).nullable().optional(),
}).openapi('StreamCursor');

// คำขอ replay ตามช่วงเวลา/tenant (optional)
export const StreamReplayRequestSchema = z.object({
  source: StreamSourceEnum,
  from_ts: z.string().datetime().optional(),
  to_ts: z.string().datetime().optional(),
  tenants: z.array(z.string().min(1)).optional(),
  limit: z.number().int().min(1).max(50000).default(5000),
}).openapi('StreamReplayRequest');

// ผลจากการ tick/stream หนึ่งรอบ
export const StreamTickResponseSchema = z.object({
  table: StreamSourceEnum,
  count: z.number().int().min(0),
}).openapi('StreamTickResponse');

/* =========================================
 *  Types
 * ========================================= */
export type IngestMeta = z.infer<typeof IngestMetaSchema>;
export type BuildDatasetRequest = z.infer<typeof BuildDatasetRequestSchema>;
export type BuildDatasetResponse = z.infer<typeof BuildDatasetResponseSchema>;
export type DatasetExport = z.infer<typeof DatasetExportSchema>;
export type ModelRegisterRequest = z.infer<typeof ModelRegisterRequestSchema>;
export type ModelRegisterResponse = z.infer<typeof ModelRegisterResponseSchema>;
export type BackfillRequest = z.infer<typeof BackfillRequestSchema>;
export type StreamCursor = z.infer<typeof StreamCursorSchema>;
export type StreamReplayRequest = z.infer<typeof StreamReplayRequestSchema>;
export type StreamTickResponse = z.infer<typeof StreamTickResponseSchema>;

