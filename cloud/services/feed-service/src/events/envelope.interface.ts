// src/events/envelope.interface.ts

/**
 * Common envelope for Kafka messages
 */
export interface MessageEnvelope<T> {
  /** Unique identifier for the event */
  eventId: string;

  /** Type of the event, e.g. 'feed_batches.created' */
  eventType: string;

  /** ISO timestamp of when the event was generated */
  timestamp: string;

  /** Payload containing event-specific data */
  payload: T;
}
