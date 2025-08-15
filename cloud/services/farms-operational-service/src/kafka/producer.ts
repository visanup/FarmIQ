// src/kafka/producer.ts
import { Kafka, logLevel, Producer } from 'kafkajs';
import { KAFKA_BROKERS, KAFKA_CLIENT_ID } from '../configs/config';

// Initialize Kafka client
const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: KAFKA_BROKERS,
  logLevel: logLevel.INFO,
});

// Create a producer instance
const producer: Producer = kafka.producer();

/**
 * Connects and initializes the Kafka producer.
 */
export async function initProducer(): Promise<void> {
  try {
    await producer.connect();
    console.log('🚀 Kafka Producer connected');
  } catch (error) {
    console.error('❌ Failed to connect Kafka producer', error);
    throw error;
  }
}

/**
 * Publishes an event message to the specified topic.
 * @param topic - Kafka topic name
 * @param message - Payload object to send
 * @param key - Optional partitioning key
 */
export async function publishEvent(topic: string, message: object, key?: string): Promise<void> {
  try {
    const recordKey = key ?? (message as any).id?.toString() ?? undefined;
    await producer.send({
      topic,
      messages: [
        {
          key: recordKey,
          value: JSON.stringify(message),
        },
      ],
    });
    console.log(`✅ Event sent to ${topic}`, recordKey, message);
  } catch (error) {
    console.error(`❌ Failed to send event to ${topic}`, error, message);
    throw error;
  }
}

/**
 * Disconnects the Kafka producer (graceful shutdown).
 */
export async function disconnectProducer(): Promise<void> {
  try {
    await producer.disconnect();
    console.log('🛑 Kafka Producer disconnected');
  } catch (error) {
    console.error('❌ Failed to disconnect Kafka producer', error);
    throw error;
  }
}
