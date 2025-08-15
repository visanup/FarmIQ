/**
 * Kafka topic names and event constants for the Economic Service
 */

/**
 * Kafka topics used by the economic-service
 */
export const TOPICS = {
  /** Topic for all economic data events */
  ECONOMIC_DATA: 'farms.economic_data',
};

/**
 * Economic data event types for message headers
 */
export const ECONOMIC_EVENTS = {
  /** Emitted when a new economic_data record is created */
  CREATED: 'economic_data.created',
  /** Emitted when an existing economic_data record is updated */
  UPDATED: 'economic_data.updated',
  /** Emitted when an economic_data record is deleted */
  DELETED: 'economic_data.deleted',
};