// src/pipelines/registry.ts
import { AlertRuleHandler, AlertRule } from '../types/alert';

// Registry for alert rules
const alertRules = new Map<string, AlertRule>();

/**
 * Register an alert rule
 * @param topic Kafka topic to listen to
 * @param handler Function to handle the topic
 * @param domain Domain of the alert rule
 */
export const registerAlertRule = (topic: string, handler: AlertRuleHandler, domain: string) => {
  alertRules.set(topic, { topic, handler, domain });
  console.log(`✅ Registered alert rule for topic: ${topic}, domain: ${domain}`);
};

/**
 * Get all registered alert rules
 * @returns Map of alert rules
 */
export const getAlertRules = () => {
  return alertRules;
};

/**
 * Initialize the registry
 */
export const initRegistry = () => {
  console.log('🔧 Initializing alert rules registry...');
  // Add any initialization logic here
  console.log('✅ Alert rules registry initialized');
};

/**
 * Get topics of registered alert rules
 * @returns Array of topics
 */
export const getTopics = () => {
  return Array.from(alertRules.keys());
};

/**
 * Get alert rule by topic
 * @param topic Kafka topic
 * @returns AlertRule or undefined
 */
export const getAlertRuleForTopic = (topic: string) => {
  return alertRules.get(topic);
};