// src/pipelines/map/deviceHealth.ts
import { z } from 'zod';
import { normalizeTime } from './time';
import type { Measurement } from '../../types/measurement';

// --- helpers ---
function parseTenantFromDeviceId(deviceId: string | undefined): string | undefined {
  if (!deviceId) return undefined;
  // ตัวอย่างเดิมสมมุติรูปแบบ: device_<tenant>_house_...
  const parts = deviceId.split('_');
  return parts.length >= 2 ? parts[1] : undefined;
}

function statusToState(status: string | undefined): 'up' | 'down' | 'degraded' | 'error' | 'unknown' {
  const s = (status || '').toLowerCase();
  if (['up', 'online', 'healthy'].includes(s)) return 'up';
  if (['down', 'offline'].includes(s)) return 'down';
  if (['degraded', 'warning', 'warn'].includes(s)) return 'degraded';
  if (['error', 'err', 'fail', 'failed'].includes(s)) return 'error';
  return 'unknown';
}

function stateToValue(state: ReturnType<typeof statusToState>): number {
  switch (state) {
    case 'up': return 1;
    case 'degraded': return 0.5;
    case 'down':
    case 'error':
    case 'unknown':
    default: return 0;
  }
}

// --- schema: ยืดหยุ่นและ normalize เวลาตั้งแต่ชั้น parse ---
const DeviceHealthEventSchema = z.object({
  eventType: z.string().optional(),
  timestamp: normalizeTime.optional(),
  headers: z.record(z.union([z.string(), z.instanceof(Buffer)])).optional(),
  data: z.object({
    id: z.string().optional(),
    deviceId: z.string(),
    status: z.string(),
    lastSeen: normalizeTime.optional(),
    batteryLevel: z.coerce.number().optional(),   // ← coerce
    signalStrength: z.coerce.number().optional(), // ← coerce
    temperature: z.coerce.number().optional(),    // ← coerce
    errors: z.array(z.string()).optional(),
    warnings: z.array(z.string()).optional(),
    createdAt: normalizeTime.optional(),
    updatedAt: normalizeTime.optional(),
    // เพิ่ม optional fields เผื่อโปรดิวเซอร์แนบมา
    sensorId: z.string().optional(),
    stationId: z.string().optional(),
    tenantId: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

export function toMeasurementFromHealth(o: any): Measurement | null {
  const event = DeviceHealthEventSchema.parse(o);
  const { data, headers } = event;

  // --- derive tenant_id แบบ fallback chain ---
  const tenant_id =
    data.tenantId ??
    (data.metadata && (data.metadata as any).tenantId) ??
    (data.metadata && (data.metadata as any).customerId) ??
    ((typeof headers?.['x-tenant-id'] === 'string' && headers!['x-tenant-id']) ||
     (typeof headers?.['x-tenant'] === 'string' && headers!['x-tenant']) ||
     parseTenantFromDeviceId(data.deviceId) ||
     'unknown');

  const state = statusToState(data.status);
  const value = stateToValue(state);

  // time priority: lastSeen > updatedAt > event.timestamp (envelope) > now
  const time =
    data.lastSeen ??
    data.updatedAt ??
    event.timestamp ??
    new Date();

  // metric ให้สอดคล้องตาม state
  const metric = `device.health.${state}`;

  // build tags เฉพาะที่มีจริง
  const tags: Record<string, string> = {
    status: data.status,
  };
  if (data.batteryLevel !== undefined) tags.battery_level = data.batteryLevel.toString();
  if (data.signalStrength !== undefined) tags.signal_strength = data.signalStrength.toString();
  if (data.temperature !== undefined) tags.temperature_c = data.temperature.toString();
  if (data.errors?.length) tags.errors = data.errors.join(',');
  if (data.warnings?.length) tags.warnings = data.warnings.join(',');
  if (data.stationId) tags.station_id = data.stationId;

  return {
    tenant_id,
    device_id: data.deviceId,
    sensor_id: data.sensorId ?? 'device-health',
    metric,
    value,
    time,
    tags,
  };
}
