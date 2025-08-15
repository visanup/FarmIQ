// src/consumers/TsEventConsumer.ts
import { Kafka, EachMessagePayload } from 'kafkajs';
import { TsEventService } from '../services/TsEvent.service';
import { KAFKA_BROKER } from '../configs/config';

const kafka = new Kafka({
  clientId: 'analytic-service',
  brokers: [KAFKA_BROKER],    // ใช้ค่าจาก config.ts
});

const consumer = kafka.consumer({ groupId: 'analytics-ts-events' });
const tsService = new TsEventService();

/**
 * Initialize the consumer for time-series events.
 * Subscribes to sensor and device topics and writes events to ts_events table.
 */
export async function initTsEventConsumer() {
  await consumer.connect();
  // Subscribe to topics publishing raw time-series events
  await consumer.subscribe({ topic: 'sensor.readings', fromBeginning: false });
  await consumer.subscribe({ topic: 'device.events', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }: EachMessagePayload) => {
      if (!message.value) return;
      try {
        const payload = JSON.parse(message.value.toString());
        // Expected payload schema:
        // { ts, source, customerId, farmId?, animalId?, batchId?, feedAssignmentId?, key, value?, rawJson? }
        await tsService.create({
          timestamp: new Date(payload.ts),
          source: payload.source,
          customerId: payload.customerId,
          farmId: payload.farmId,
          animalId: payload.animalId,
          batchId: payload.batchId,
          feedAssignmentId: payload.feedAssignmentId,
          key: payload.key,
          value: payload.value,
          rawJson: payload.rawJson || payload,
        });
      } catch (error) {
        console.error('Failed to process TS event message', error);
      }
    },
  });
}
