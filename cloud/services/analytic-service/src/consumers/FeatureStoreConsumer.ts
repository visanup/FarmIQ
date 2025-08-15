// src/consumers/FeatureStoreConsumer.ts
import { Kafka, EachMessagePayload } from 'kafkajs';
import { FeatureStoreService } from '../services/FeatureStore.service';
import { KAFKA_BROKER } from '../configs/config';

const kafka = new Kafka({
  clientId: 'analytic-service',
  brokers: [KAFKA_BROKER],    // ใช้ค่าจาก config.ts
});
const consumer = kafka.consumer({ groupId: 'analytics-feature-store' });
const featureService = new FeatureStoreService();

export async function initFeatureStoreConsumer() {
  await consumer.connect();
  // Subscribe to the topic where engineered features are published
  await consumer.subscribe({ topic: 'features.generated', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }: EachMessagePayload) => {
      if (!message.value) return;
      try {
        const payload = JSON.parse(message.value.toString());
        // Expected payload schema:
        // { customerId, farmId, animalId, batchId?, feedAssignmentId?, featureName, featureValue, featureDate }
        await featureService.create({
          customerId: payload.customerId,
          farmId: payload.farmId,
          animalId: payload.animalId,
          batchId: payload.batchId,
          feedAssignmentId: payload.feedAssignmentId,
          featureName: payload.featureName,
          featureValue: payload.featureValue,
          featureDate: new Date(payload.featureDate),
        });
      } catch (error) {
        console.error('Failed to process feature store message', error);
      }
    },
  });
}