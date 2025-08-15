// src/consumers/PipelineMetadataConsumer.ts
import { Kafka, EachMessagePayload } from 'kafkajs';
import { PipelineMetadataService } from '../services/PipelineMetadata.service';
import { KAFKA_BROKER } from '../configs/config';

const kafka = new Kafka({
  clientId: 'analytic-service',
  brokers: [KAFKA_BROKER],    // ใช้ค่าจาก config.ts
});

const consumer = kafka.consumer({ groupId: 'analytics-pipeline-metadata' });
const pipelineService = new PipelineMetadataService();

export async function initPipelineMetadataConsumer() {
  await consumer.connect();
  // Subscribe to the topic where pipeline lifecycle events are published
  await consumer.subscribe({ topic: 'pipeline.events', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }: EachMessagePayload) => {
      if (!message.value) return;
      try {
        const payload = JSON.parse(message.value.toString());
        // Expected payload schema:
        // { runId, pipelineName, version, event, timestamp, metrics? }
        if (payload.event === 'start') {
          await pipelineService.start({
            runId: payload.runId,
            pipelineName: payload.pipelineName,
            version: payload.version,
            // startedAt is defaulted to NOW()
          });
        } else if (payload.event === 'finish') {
          await pipelineService.finish(payload.runId, {
            status: payload.status,
            finishedAt: new Date(payload.timestamp),
            metrics: payload.metrics,
          });
        }
      } catch (error) {
        console.error('Failed to process pipeline metadata message', error);
      }
    },
  });
}
