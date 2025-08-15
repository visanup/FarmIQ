// src/kafka/topics.ts

/**
 * Kafka topic constants for farms-operational-service events.
 * Each table in the operational schema has three events: created, updated, deleted.
 */
export const topics = {
  // Feed Intake events
  FEED_INTAKE_CREATED: 'farms-operational.feed_intake.created',
  FEED_INTAKE_UPDATED: 'farms-operational.feed_intake.updated',
  FEED_INTAKE_DELETED: 'farms-operational.feed_intake.deleted',

  // Genetic Factors events
  GENETIC_FACTORS_CREATED: 'farms-operational.genetic_factors.created',
  GENETIC_FACTORS_UPDATED: 'farms-operational.genetic_factors.updated',
  GENETIC_FACTORS_DELETED: 'farms-operational.genetic_factors.deleted',

  // Feed Programs events
  FEED_PROGRAMS_CREATED: 'farms-operational.feed_programs.created',
  FEED_PROGRAMS_UPDATED: 'farms-operational.feed_programs.updated',
  FEED_PROGRAMS_DELETED: 'farms-operational.feed_programs.deleted',

  // Environmental Factors events
  ENVIRONMENTAL_FACTORS_CREATED: 'farms-operational.environmental_factors.created',
  ENVIRONMENTAL_FACTORS_UPDATED: 'farms-operational.environmental_factors.updated',
  ENVIRONMENTAL_FACTORS_DELETED: 'farms-operational.environmental_factors.deleted',

  // Housing Conditions events
  HOUSING_CONDITIONS_CREATED: 'farms-operational.housing_conditions.created',
  HOUSING_CONDITIONS_UPDATED: 'farms-operational.housing_conditions.updated',
  HOUSING_CONDITIONS_DELETED: 'farms-operational.housing_conditions.deleted',

  // Water Quality events
  WATER_QUALITY_CREATED: 'farms-operational.water_quality.created',
  WATER_QUALITY_UPDATED: 'farms-operational.water_quality.updated',
  WATER_QUALITY_DELETED: 'farms-operational.water_quality.deleted',

  // Health Records events
  HEALTH_RECORDS_CREATED: 'farms-operational.health_records.created',
  HEALTH_RECORDS_UPDATED: 'farms-operational.health_records.updated',
  HEALTH_RECORDS_DELETED: 'farms-operational.health_records.deleted',

  // Welfare Indicators events
  WELFARE_INDICATORS_CREATED: 'farms-operational.welfare_indicators.created',
  WELFARE_INDICATORS_UPDATED: 'farms-operational.welfare_indicators.updated',
  WELFARE_INDICATORS_DELETED: 'farms-operational.welfare_indicators.deleted',

  // Operational Records events
  OPERATIONAL_RECORDS_CREATED: 'farms-operational.operational_records.created',
  OPERATIONAL_RECORDS_UPDATED: 'farms-operational.operational_records.updated',
  OPERATIONAL_RECORDS_DELETED: 'farms-operational.operational_records.deleted',

  // Performance Metrics events
  PERFORMANCE_METRICS_CREATED: 'farms-operational.performance_metrics.created',
  PERFORMANCE_METRICS_UPDATED: 'farms-operational.performance_metrics.updated',
  PERFORMANCE_METRICS_DELETED: 'farms-operational.performance_metrics.deleted',
} as const;

// Types for type-safe access
export type TopicKey = keyof typeof topics;
export type TopicName = typeof topics[TopicKey];