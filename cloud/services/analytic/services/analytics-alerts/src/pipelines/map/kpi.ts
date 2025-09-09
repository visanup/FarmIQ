// src/pipelines/map/kpi.ts
import { AlertRuleHandler, AlertCreationData } from '../../types/alert';

/**
 * Handle KPI messages
 * @param payload Kafka message payload
 * @returns Promise<AlertCreationData | null> generated alert data or null
 */
export const handleKPI = async (payload: any): Promise<AlertCreationData | null> => {
  // Example: Handle KPI threshold breaches
  if (payload.kpi_name === 'FCR' && payload.value > 2.5) {
    return {
      type: 'kpi_threshold_breach',
      message: `KPI threshold breach: ${payload.kpi_name} = ${payload.value}`,
      metadata: {
        target: payload.target_value,
        deviation: payload.value - payload.target_value
      },
      tenant_id: payload.tenant_id,
      factory_id: payload.factory_id,
      device_id: payload.machine_id,
      metric: payload.kpi_name,
      value: payload.value,
      alert_time: new Date(payload.time),
      severity: 'medium',
      alert_type: 'kpi'
    };
  }
  
  return null;
};