// src/schemas/orchestrator.schemas.ts
import { z } from '../utils/zod';

/* ========== Ingest ========== */

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
  // NOTE: ถ้าฐานข้อมูลใช้ UUID ให้เปลี่ยนเป็น z.string().uuid()
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
  // Zod v4 ต้องระบุ key + value type
  meta: z.record(z.string(), z.unknown()).optional(),
}).openapi('MediaObject');

/* ========== Datasets ========== */

export const BuildDatasetRequestSchema = z.object({
  limit: z.number().int().min(1).max(50000).default(5000),
  split: z.object({
    train: z.number().min(0).max(1).default(0.8),
    val:   z.number().min(0).max(1).default(0.1),
    test:  z.number().min(0).max(1).default(0.1),
  }).partial().optional(),
}).openapi('BuildDatasetRequest');

export const BuildDatasetResponseSchema = z.object({
  dataset_s3: z.string().regex(/^s3:\/\//),
  rows: z.number().int().min(0),
}).openapi('BuildDatasetResponse');

export const DatasetExportSchema = z.object({
  id: z.string().uuid(),
  dataset_s3: z.string().regex(/^s3:\/\//),
  rows: z.number().int().min(0),
  meta_json: z.record(z.string(), z.unknown()).optional(),
  created_at: z.string().datetime(),
}).openapi('DatasetExport');

/* ========== Models.register ========== */

export const ModelRegisterRequestSchema = z.object({
  model_name: z.string().min(1),
  version: z.string().min(1),
  artifact_s3: z.string().regex(/^s3:\/\//, 'must start with s3://'),
  metrics: z.record(z.string(), z.unknown()).optional(),
  auto_deploy: z.boolean().default(true).optional(),
}).openapi('ModelRegisterRequest');

export const ModelRegisterResponseSchema = z.object({
  id: z.string().uuid(),
  model_name: z.string(),
  version: z.string(),
}).openapi('ModelRegisterResponse');

/* ========== Infer.backfill ========== */

export const BackfillRequestSchema = z.object({
  object_keys: z.array(z.string()).nonempty(),
}).openapi('BackfillRequest');

/* ========== Types (optional) ========== */
export type IngestMeta = z.infer<typeof IngestMetaSchema>;
