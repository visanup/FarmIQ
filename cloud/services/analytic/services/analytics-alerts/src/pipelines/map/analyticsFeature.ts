// src/pipelines/map/analyticsFeature.ts
import { AlertRuleHandler, AlertCreationData } from '../../types/alert';

/**
 * Handle analytics feature messages
 * @param payload Kafka message payload
 * @returns Promise<AlertCreationData | null> generated alert data or null
 */
export const handleAnalyticsFeature = async (payload: any): Promise<AlertCreationData | null> => {
  // Example: Check if temperature exceeds threshold
  if (payload.metric === 'temp' && payload.avg_val > 30) {
    return {
      type: 'high_temperature',
      message: `High temperature detected: ${payload.avg_val}°C`,
      metadata: {
        bucket: payload.bucket_start,
        window: payload.window_s,
        sensor: payload.sensor_id
      },
      tenant_id: payload.tenant_id,
      factory_id: payload.factory_id,
      device_id: payload.machine_id,
      metric: payload.metric,
      value: payload.avg_val,
      alert_time: new Date(payload.bucket_start),
      severity: 'high',
      alert_type: 'temperature'
    };
  }
  
  // Add more feature checks here
  
  return null;
};