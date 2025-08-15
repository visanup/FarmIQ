// src/kafka/topics.ts

/**
 * Kafka topic names
 */
export const FEED_BATCHES_TOPIC = 'feeds.feed_batches';
export const PHYSICAL_QUALITY_TOPIC = 'feeds.physical_quality';
export const CHEMICAL_QUALITY_TOPIC = 'feeds.chemical_quality';
export const PELLET_MILL_CONDITION_TOPIC = 'feeds.pellet_mill_condition';
export const MIXING_CONDITION_TOPIC = 'feeds.mixing_condition';
export const GRINDING_CONDITION_TOPIC = 'feeds.grinding_condition';
export const FEED_BATCH_ASSIGNMENTS_TOPIC = 'feeds.feed_batch_assignments';

/**
 * Event type constants
 */
export const FeedBatchesEvents = {
  Created: 'feed_batches.created',
  Updated: 'feed_batches.updated',
  Deleted: 'feed_batches.deleted',
} as const;

export const PhysicalQualityEvents = {
  Added: 'physical_quality.added',
  Updated: 'physical_quality.updated',
  Removed: 'physical_quality.removed',
} as const;

export const ChemicalQualityEvents = {
  Added: 'chemical_quality.added',
  Updated: 'chemical_quality.updated',
  Removed: 'chemical_quality.removed',
} as const;

export const PelletMillConditionEvents = {
  Added: 'pellet_mill_condition.added',
  Updated: 'pellet_mill_condition.updated',
  Removed: 'pellet_mill_condition.removed',
} as const;

export const MixingConditionEvents = {
  Added: 'mixing_condition.added',
  Updated: 'mixing_condition.updated',
  Removed: 'mixing_condition.removed',
} as const;

export const GrindingConditionEvents = {
  Added: 'grinding_condition.added',
  Updated: 'grinding_condition.updated',
  Removed: 'grinding_condition.removed',
} as const;

export const FeedBatchAssignmentsEvents = {
  Assigned: 'feed_batch_assignments.assigned',
  Updated: 'feed_batch_assignments.updated',
  Unassigned: 'feed_batch_assignments.unassigned',
} as const;
