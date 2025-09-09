// src/types/alert.ts
import { Alert } from '../models/alert.model';

/**
 * Type for alert creation data (without auto-generated fields)
 */
export type AlertCreationData = Omit<Alert, 'id' | 'is_resolved' | 'created_at' | 'resolved_at'>;

/**
 * Type for a function that handles a Kafka message and returns alert creation data
 */
export type AlertRuleHandler = (payload: any) => Promise<AlertCreationData | null>;

/**
 * Type for an alert rule
 */
export type AlertRule = {
  topic: string;
  handler: AlertRuleHandler;
  domain: string;
};