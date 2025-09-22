// src/pipelines/map/sensors.ts
import { z } from 'zod';
import { normalizeTime } from './time';
import type { Measurement } from '../../types/measurement';

// Schema for the new data structure from sensor-streamer-service
const SensorReadingEventSchema = z.object({
  eventType: z.string(),
  timestamp: z.string(),
  data: z.object({
    deviceId: z.string(),
    value: z.number(),
    timestamp: z.string(),
    // Fields that might be in payload
    farmId: z.string().optional(),
    houseId: z.string().optional(),
    sensorType: z.string().optional(),
    unit: z.string().optional(),
    location: z.object({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    }).optional(),
    metadata: z.object({
      farmName: z.string().optional(),
      houseName: z.string().optional(),
      customerId: z.string().optional(),
      readingType: z.string().optional(),
      sensorModel: z.string().optional(),
      firmwareVersion: z.string().optional(),
    }).optional(),
    // Payload field that contains the actual sensor data
    payload: z.object({
      unit: z.string().optional(),
      location: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number(),
      }).optional(),
      metadata: z.object({
        farmName: z.string().optional(),
        houseName: z.string().optional(),
        customerId: z.string().optional(),
        readingType: z.string().optional(),
        sensorModel: z.string().optional(),
        firmwareVersion: z.string().optional(),
      }).optional(),
      farmId: z.string().optional(),
      houseId: z.string().optional(),
      sensorType: z.string().optional(),
    }).optional(),
  })
});

export function toMeasurementFromSensor(o: any): Measurement | null {
  console.log('🔍 [SENSOR-MAPPER] Input data structure:', JSON.stringify(o, null, 2));
  
  const event = SensorReadingEventSchema.parse(o);
  const data = event.data;
  
  console.log('🔍 [SENSOR-MAPPER] Parsed data:', {
    deviceId: data.deviceId,
    value: data.value,
    sensorType: data.sensorType,
    payload: data.payload
  });
  
  // Extract data from data fields directly (not from payload)
  const sensorType = data.sensorType || 'unknown';
  const farmId = data.farmId || 'unknown';
  const houseId = data.houseId || 'unknown';
  const unit = data.unit || 'unknown';
  const location = data.location;
  const metadata = data.metadata || {};
  
  console.log('🔍 [SENSOR-MAPPER] Extracted values:', {
    sensorType,
    farmId,
    houseId,
    unit,
    hasLocation: !!location,
    metadataKeys: Object.keys(metadata)
  });
  
  // Extract tenant_id from deviceId (assuming format: device_tenant_house_flock)
  const deviceParts = data.deviceId.split('_');
  const tenant_id = deviceParts.length >= 2 ? deviceParts[1] : 'unknown';
  
  // Use value directly (already a number)
  const value = data.value;
  if (isNaN(value)) {
    throw new Error(`Invalid sensor value: ${data.value}`);
  }
  
  // Build tags object with actual values from metadata, not fallback 'unknown'
  const tags: Record<string, string> = {
    sensor_type: sensorType,
    unit: unit,
    farm_id: farmId,
    house_id: houseId,
    farm_name: metadata.farmName || farmId, // Use farmId as fallback instead of 'unknown'
    house_name: metadata.houseName || houseId, // Use houseId as fallback instead of 'unknown'
    customer_id: metadata.customerId || '1', // Use default customer instead of 'unknown'
    reading_type: metadata.readingType || 'sensor_reading', // Use descriptive fallback
    sensor_model: metadata.sensorModel || 'default_model', // Use descriptive fallback
    firmware_version: metadata.firmwareVersion || '1.0.0', // Use version fallback
    location_x: location?.x?.toString() || '0',
    location_y: location?.y?.toString() || '0',
    location_z: location?.z?.toString() || '0',
  };

  const normalized = sensorType.toLowerCase();
  const metric = normalized.includes('.') ? normalized : `sensor.${normalized}`;

  return {
    tenant_id,
    device_id: data.deviceId,
    sensor_id: sensorType, // Use actual sensor type instead of 'unknown'
    metric,
    value,
    time: new Date(data.timestamp),
    tags
  };
}


