import { Kafka, logLevel, Producer } from 'kafkajs';
import { KAFKA_BROKERS, KAFKA_SSL } from '../configs/config';

let producer: Producer | null = null;

export async function getProducer(): Promise<Producer> {
  if (producer) return producer;
  const kafka = new Kafka({
    clientId: 'auth-service',
    brokers: KAFKA_BROKERS.split(',').map((s) => s.trim()),
    ssl: KAFKA_SSL,
    logLevel: logLevel.ERROR,
  });
  producer = kafka.producer();
  await producer.connect();
  return producer;
}

export async function publish(topic: string, message: any) {
  try {
    const p = await getProducer();
    await p.send({ topic, messages: [{ value: JSON.stringify(message) }] });
  } catch (err: any) {
    // Log error but don't throw - auth flow should continue
    console.warn(`Failed to publish to Kafka topic ${topic}:`, err.message);
    // Don't rethrow the error to prevent blocking auth operations
  }
}

