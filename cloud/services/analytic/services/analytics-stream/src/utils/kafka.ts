// src/utils/kafka.ts

import { Kafka, logLevel, Partitioners } from 'kafkajs';
import { env, brokers } from '../configs/config';

export const kafka = new Kafka({
  clientId: env.KAFKA_CLIENT_ID,
  brokers,
  logLevel: logLevel.INFO,
});

// 👇 เพิ่ม createPartitioner ที่ producer
export const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});

export const consumer = kafka.consumer({ groupId: env.CONSUMER_GROUP });
