// src/pipelines/types/alert.ts
import { Alert } from '../../models/alert.model';

/**
 * Type for an alert rule
 */
export type AlertRule = {
  topic: string;
  handler: AlertRuleHandler;
  domain: string;
};

/**
 * Type for an alert rule handler
 * @param payload Kafka message payload
 * @returns Alert | null generated alert or null if no alert is needed
 */
export type AlertRuleHandler = (payload: any) => Promise<Alert | null>;

/**
 * Type for an alert handler
 * @param payload Kafka message payload
 * @returns Alert | null generated alert or null if no alert is needed
 */
export type AlertHandler = (payload: any) => Promise<Alert | null>;

/**
 * Type for a Kafka message
 */
export type KafkaMessage = {
  key: string | null;
  value: string;
  headers: Record<string, any>;
  topic: string;
  partition: number;
  timestamp: string;
};