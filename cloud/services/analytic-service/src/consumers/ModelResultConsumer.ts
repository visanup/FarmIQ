// src/consumers/ModelResultConsumer.ts
import { Kafka, EachMessagePayload } from 'kafkajs';
import { ModelResultService } from '../services/ModelResult.service';
// Import broker config
import { KAFKA_BROKER } from '../configs/config';

const kafka = new Kafka({
  clientId: 'analytic-service',
  brokers: [KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: 'analytics-model-results' });
const resultService = new ModelResultService();

/**
 * Initialize ModelResult consumer to process model prediction events.
 */
export async function initModelResultConsumer() {
  await consumer.connect();
  // Subscribe to the topic where model predictions are published
  await consumer.subscribe({ topic: 'models.predictions', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }: EachMessagePayload) => {
      if (!message.value) return;
      try {
        const payload = JSON.parse(message.value.toString());
        // Expected payload schema:
        // { customerId, farmId, animalId, batchId?, feedAssignmentId?, modelName, prediction, anomalyScore?, resultDate }
        await resultService.create({
          customerId: payload.customerId,
          farmId: payload.farmId,
          animalId: payload.animalId,
          batchId: payload.batchId,
          feedAssignmentId: payload.feedAssignmentId,
          modelName: payload.modelName,
          prediction: payload.prediction,
          anomalyScore: payload.anomalyScore,
          resultDate: new Date(payload.resultDate),
        });
      } catch (error) {
        console.error('Failed to process model result message', error);
      }
    },
  });
}

