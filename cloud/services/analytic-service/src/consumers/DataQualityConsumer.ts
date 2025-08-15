// src/consumers/DataQualityConsumer.ts
import { Kafka, EachMessagePayload } from 'kafkajs';
import { DataQualityLogService } from '../services/DataQualityLog.service';
import { KAFKA_BROKER } from '../configs/config';

const kafka = new Kafka({
  clientId: 'analytic-service',
  brokers: [KAFKA_BROKER],    // ใช้ค่าจาก config.ts
});

const consumer = kafka.consumer({ groupId: 'analytics-data-quality' });
const dqService = new DataQualityLogService();

export async function initDataQualityConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'dq.issues', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }: EachMessagePayload) => {
      if (!message.value) return;
      try {
        const payload = JSON.parse(message.value.toString());
        // Expected payload: { runId, tableName, recordId?, issueType, details }
        await dqService.log({
          runId: payload.runId,
          tableName: payload.tableName,
          recordId: payload.recordId,
          issueType: payload.issueType,
          details: payload.details,
        });
      } catch (error) {
        console.error('Failed to process data quality message', error);
      }
    },
  });
}
