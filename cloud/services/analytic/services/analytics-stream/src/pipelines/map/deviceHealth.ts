// src/pipelines/map/deviceHealth.ts

import { z } from 'zod';
import { normalizeTime } from './time';
import type { Measurement } from '../../types/measurement';

// Schema for the nested data structure from sensor-streamer-service
const DeviceHealthEventSchema = z.object({
  eventType: z.string(),
  timestamp: z.string(),
  data: z.object({
    id: z.string().optional(),
    deviceId: z.string(),
    status: z.string(),
    lastSeen: z.string(),
    batteryLevel: z.number().optional(),
    signalStrength: z.number().optional(),
    temperature: z.string().optional(),
    errors: z.array(z.string()).optional(),
    warnings: z.array(z.string()).optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
});

export function toMeasurementFromHealth(o:any): Measurement | null {
  const event = DeviceHealthEventSchema.parse(o);
  const data = event.data;
  
  // Map status to numeric value
  let value: number;
  switch (data.status.toLowerCase()) {
    case 'up':
    case 'online':
    case 'healthy':
      value = 1;
      break;
    case 'down':
    case 'offline':
    case 'error':
      value = 0;
      break;
    case 'degraded':
    case 'warning':
      value = 0.5;
      break;
    default:
      value = 0; // Default to down for unknown statuses
  }
  
  // Extract tenant_id from deviceId (assuming format: device_tenant_house_flock)
  const deviceParts = data.deviceId.split('_');
  const tenant_id = deviceParts.length >= 2 ? deviceParts[1] : 'unknown';
  
  // Build tags object with only defined values
  const tags: Record<string, string> = {
    status: data.status,
  };
  
  if (data.batteryLevel !== undefined) {
    tags.battery_level = data.batteryLevel.toString();
  }
  if (data.signalStrength !== undefined) {
    tags.signal_strength = data.signalStrength.toString();
  }
  if (data.temperature !== undefined) {
    tags.temperature = data.temperature;
  }
  if (data.errors && data.errors.length > 0) {
    tags.errors = data.errors.join(',');
  }
  if (data.warnings && data.warnings.length > 0) {
    tags.warnings = data.warnings.join(',');
  }

  return {
    tenant_id,
    device_id: data.deviceId,
    metric: data.status.toLowerCase() === 'error' ? 'device.health.error' : 'device.health.up',
    value,
    time: new Date(data.lastSeen || data.updatedAt || event.timestamp),
    tags
  };
}
