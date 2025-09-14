// src/utils/kafka.ts
import { Kafka, Partitioners } from 'kafkajs';
import { KAFKA_BROKERS } from '../configs/config';

// Allow overriding via envs (sane defaults for your analytics-alerts service)
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || 'analytics-alerts';
const KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID || 'analytics-alerts-group';
// Set to 'legacy' to keep KafkaJS v1 behavior, 'default' to use v2 default
const KAFKA_PARTITIONER = (process.env.KAFKA_PARTITIONER || 'legacy').toLowerCase();

// Pick the partitioner explicitly to avoid KafkaJS v2 warning & control behavior
const createPartitioner =
  KAFKA_PARTITIONER === 'legacy'
    ? Partitioners.LegacyPartitioner
    : Partitioners.DefaultPartitioner;

// Create Kafka client
const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: KAFKA_BROKERS.split(',').map((b) => b.trim()),
});

// Create Kafka consumer
export const consumer = kafka.consumer({
  groupId: KAFKA_GROUP_ID,
});

// Create Kafka producer with explicit partitioner
export const producer = kafka.producer({ createPartitioner });

/**
 * Connect to Kafka and subscribe to topics
 * @param topics Topics to subscribe to
 */
export const connectKafka = async (topics: string[]) => {
  try {
    await consumer.connect();
    await producer.connect();

    for (const topic of topics) {
      await consumer.subscribe({ topic, fromBeginning: false });
    }

    console.log(
      `✅ Connected to Kafka (clientId=${KAFKA_CLIENT_ID}, groupId=${KAFKA_GROUP_ID}, partitioner=${KAFKA_PARTITIONER})`
    );
  } catch (error) {
    console.error('❌ Failed to connect to Kafka:', error);
    throw error;
  }
};

/**
 * Send a message to a topic (with optional key for deterministic partitioning)
 */
export const sendKafkaMessage = async (
  topic: string,
  value: unknown,
  key?: string
) => {
  const payload =
    typeof value === 'string' || Buffer.isBuffer(value)
      ? (value as any)
      : JSON.stringify(value);

  await producer.send({
    topic,
    messages: [{ key, value: payload }],
  });
};

/**
 * Disconnect from Kafka
 */
export const disconnectKafka = async () => {
  try {
    await consumer.disconnect();
    await producer.disconnect();
    console.log('🔌 Disconnected from Kafka');
  } catch (error) {
    console.error('❌ Failed to disconnect from Kafka:', error);
  }
};
