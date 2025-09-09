// src/schemas/analytics.schemas.ts
import { z } from 'zod';

// Extend zod with OpenAPI support
try {
  const { extendZodWithOpenApi } = require('@asteasolutions/zod-to-openapi');
  extendZodWithOpenApi(z);
} catch (e) {
  // If @asteasolutions/zod-to-openapi is not available, just skip
}

/**
 * Alert schema
 */
export const alertSchema = z.object({
  type: z.string().min(1),
  message: z.string().min(1),
  metadata: z.record(z.any()).optional(),
  tenant_id: z.string().min(1),
  factory_id: z.string().min(1),
  device_id: z.string().min(1),
  metric: z.string().min(1),
  value: z.number(),
  alert_time: z.string().datetime(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  alert_type: z.string().min(1)
});

export type AlertSchema = z.infer<typeof alertSchema>;

/**
 * Alert response schema
 */
export const alertResponseSchema = z.object({
  id: z.number(),
  type: z.string(),
  message: z.string(),
  metadata: z.record(z.any()).optional(),
  is_resolved: z.boolean(),
  created_at: z.string().datetime(),
  resolved_at: z.string().datetime().optional(),
  tenant_id: z.string(),
  factory_id: z.string(),
  device_id: z.string(),
  metric: z.string(),
  value: z.number(),
  alert_time: z.string().datetime(),
  severity: z.string(),
  alert_type: z.string(),
  additional_info: z.record(z.any()).optional()
});

export type AlertResponse = z.infer<typeof alertResponseSchema>;

/**
 * Alert list response schema
 */
export const alertListResponseSchema = z.array(alertResponseSchema);

export type AlertListResponse = z.infer<typeof alertListResponseSchema>;

/**
 * Alert creation response schema
 */
export const alertCreationResponseSchema = z.object({
  id: z.number(),
  ...alertSchema.shape
});

export type AlertCreationResponse = z.infer<typeof alertCreationResponseSchema>;

/**
 * Alert resolution response schema
 */
export const alertResolutionResponseSchema = z.object({
  id: z.number(),
  is_resolved: z.boolean(),
  resolved_at: z.string().datetime()
});

export type AlertResolutionResponse = z.infer<typeof alertResolutionResponseSchema>;

/**
 * Alert ID parameter schema
 */
export const alertIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

export type AlertIdParam = z.infer<typeof alertIdParamSchema>;

/**
 * Tenant ID parameter schema
 */
export const tenantIdParamSchema = z.object({
  tenantId: z.string().min(1)
});

export type TenantIdParam = z.infer<typeof tenantIdParamSchema>;

/**
 * Tenant and factory ID parameter schema
 */
export const tenantAndFactoryIdParamSchema = z.object({
  tenantId: z.string().min(1),
  factoryId: z.string().min(1)
});

export type TenantAndFactoryIdParam = z.infer<typeof tenantAndFactoryIdParamSchema>;

// All schemas are already exported above