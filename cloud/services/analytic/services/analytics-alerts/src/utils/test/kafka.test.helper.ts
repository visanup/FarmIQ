// src/utils/test/kafka.test.helper.ts
import { Kafka } from 'kafkajs';
import { KAFKA_BROKERS } from '../../configs/config';

// Create test Kafka client
export const createTestKafkaClient = () => {
  return new Kafka({
    clientId: 'test-producer',
    brokers: KAFKA_BROKERS.split(',')
  });
};

// Send test message to Kafka topic
export const sendTestMessage = async (topic: string, message: any) => {
  const kafka = createTestKafkaClient();
  const producer = kafka.producer();
  
  await producer.connect();
  
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }]
  });
  
  await producer.disconnect();
};