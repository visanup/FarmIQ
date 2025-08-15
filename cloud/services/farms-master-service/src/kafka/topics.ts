// src/kafka/topics.ts

/**
 * Kafka topic constants for Farms Master Service events.
 * Use these to publish or subscribe to specific event streams.
 */
export const topics = {
  // Farm events
  FARM_CREATED: 'farms-master.farm.created',
  FARM_UPDATED: 'farms-master.farm.updated',
  FARM_DELETED: 'farms-master.farm.deleted',

  // House events
  HOUSE_CREATED: 'farms-master.house.created',
  HOUSE_UPDATED: 'farms-master.house.updated',
  HOUSE_DELETED: 'farms-master.house.deleted',

  // Animal events
  ANIMAL_CREATED: 'farms-master.animal.created',
  ANIMAL_UPDATED: 'farms-master.animal.updated',
  ANIMAL_DELETED: 'farms-master.animal.deleted',

  // Batch events
  BATCH_CREATED: 'farms-master.batch.created',
  BATCH_UPDATED: 'farms-master.batch.updated',
  BATCH_DELETED: 'farms-master.batch.deleted',
} as const;

// For type-safe imports
export type TopicKey = keyof typeof topics;
export type TopicName = typeof topics[TopicKey];