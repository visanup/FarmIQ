// src/kafka/producer.ts
import { Kafka, Producer } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';
import { KAFKA_BROKERS, KAFKA_CLIENT_ID } from '../configs/config';
import { MessageEnvelope } from '../events/envelope.interface';

// Initialize Kafka client
const kafka = new Kafka({ clientId: KAFKA_CLIENT_ID, brokers: KAFKA_BROKERS });
let producer: Producer | null = null;

/**
 * Get or create a connected Kafka producer
 */
async function getProducer(): Promise<Producer> {
  if (producer) return producer;
  producer = kafka.producer();
  await producer.connect();
  return producer;
}

/**
 * Publish a single event to the given topic
 * @param topic Kafka topic name
 * @param eventType event type constant (e.g. 'feed_batches.created')
 * @param payload event-specific data
 */
export async function publishEvent<T>(
  topic: string,
  eventType: string,
  payload: T
): Promise<void> {
  const producer = await getProducer();
  const envelope: MessageEnvelope<T> = {
    eventId: uuidv4(),
    eventType,
    timestamp: new Date().toISOString(),
    payload,
  };

  await producer.send({
    topic,
    messages: [
      {
        key: envelope.eventId,
        value: JSON.stringify(envelope),
      },
    ],
  });
}

/**
 * Gracefully disconnect the producer
 */
export async function disconnectProducer(): Promise<void> {
  if (producer) {
    await producer.disconnect();
    producer = null;
  }
}
