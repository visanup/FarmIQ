// services/external-factor-service/src/kafka/topics.ts

/**
 * Kafka topic names and event type constants for External Factors service
 */

// Main topic for external factors events
export const TOPIC_EXTERNAL_FACTORS = 'external.factors';

// Event types
export const EVENT_EXTERNAL_FACTORS_CREATED = 'external_factors.created';
export const EVENT_EXTERNAL_FACTORS_UPDATED = 'external_factors.updated';
export const EVENT_EXTERNAL_FACTORS_DELETED = 'external_factors.deleted';

// Group exports for easy import
export const ExternalFactorTopics = {
  TOPIC: TOPIC_EXTERNAL_FACTORS,
  CREATED: EVENT_EXTERNAL_FACTORS_CREATED,
  UPDATED: EVENT_EXTERNAL_FACTORS_UPDATED,
  DELETED: EVENT_EXTERNAL_FACTORS_DELETED,
};