// src/pipelines/map/anomaly.ts
import { AlertRuleHandler, AlertCreationData } from '../../types/alert';

/**
 * Handle anomaly messages
 * @param payload Kafka message payload
 * @returns Promise<AlertCreationData | null> generated alert data or null
 */
export const handleAnomaly = async (payload: any): Promise<AlertCreationData | null> => {
  // Example: Handle anomaly detection
  if (payload.severity >= 3) {
    return {
      type: 'anomaly_detected',
      message: `Anomaly detected: ${payload.type}`,
      metadata: {
        score: payload.score,
        pattern: payload.pattern
      },
      tenant_id: payload.tenant_id,
      factory_id: payload.factory_id,
      device_id: payload.machine_id,
      metric: payload.metric,
      value: payload.value,
      alert_time: new Date(payload.time),
      severity: payload.severity >= 5 ? 'critical' : 'medium',
      alert_type: 'anomaly'
    };
  }
  
  return null;
};