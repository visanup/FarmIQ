// src/utils/kafka.ts
import { Kafka } from 'kafkajs';
import { KAFKA_BROKERS } from '../configs/config';

// Create Kafka client
const kafka = new Kafka({
  clientId: 'analytics-alerts',
  brokers: KAFKA_BROKERS.split(',')
});

// Create Kafka consumer
export const consumer = kafka.consumer({
  groupId: 'analytics-alerts-group'
});

// Create Kafka producer
export const producer = kafka.producer();

/**
 * Connect to Kafka and subscribe to topics
 * @param topics Topics to subscribe to
 */
export const connectKafka = async (topics: string[]) => {
  try {
    await consumer.connect();
    await producer.connect();
    
    for (const topic of topics) {
      await consumer.subscribe({ topic });
    }
    
    console.log('✅ Connected to Kafka');
  } catch (error) {
    console.error('❌ Failed to connect to Kafka:', error);
    throw error;
  }
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