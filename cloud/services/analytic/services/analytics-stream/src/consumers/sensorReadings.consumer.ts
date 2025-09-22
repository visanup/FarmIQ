// src/consumers/sensorReadings.consumer.ts
// Legacy single-topic consumer kept for compatibility/testing.
// The main service now uses consumers/router.ts to subscribe to all topics.

import { consumer, producer } from '../utils/kafka';
import { tenantFilterList, dlqTopic, env } from '../configs/config';
import { logger } from '../utils/logger';
import { MeasurementSchema } from '../types/measurement';
import { upsertMinuteFeature } from '../stores/analyticsFeature.repo';
import { toMeasurementFromSensor } from '../pipelines/map/sensors';

/** Run a focused consumer for sensor readings only (optional/legacy). */
export async function runSensorReadingsConsumer() {
  // Make connect idempotent
  try { await producer.connect(); } catch {}
  try { await consumer.connect(); } catch {}

  const topic = env.TOPIC_SENSORS;
  await consumer.subscribe({ topic, fromBeginning: false });

  await consumer.run({
    eachBatchAutoResolve: true,
    eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }) => {
      for (const message of batch.messages) {
        if (!isRunning() || isStale()) break;
        const offset = message.offset;
        const raw = message.value?.toString('utf8') ?? '';

        try {
          // Map incoming event to Measurement (same mapper used by router)
          const mapped = toMeasurementFromSensor(JSON.parse(raw));
          const list = Array.isArray(mapped) ? mapped : [mapped];

          for (const m of list) {
            const mm = MeasurementSchema.parse(m);
            // tenant filter
            if (tenantFilterList.length && !tenantFilterList.includes(mm.tenant_id)) continue;
            await upsertMinuteFeature({
              tenant_id: mm.tenant_id,
              device_id: mm.device_id,
              sensor_id: mm.sensor_id,
              metric: mm.metric,
              value: mm.value,
              time: mm.time,
              tags: mm.tags,
            });
          }

          resolveOffset(offset);
        } catch (err: any) {
          // send to DLQ and skip this message
          logger.warn({ err, raw }, 'sensor-readings-invalid -> DLQ');
          try {
            await producer.send({
              topic: dlqTopic,
              messages: [{
                key: Buffer.from(`${batch.topic}:${batch.partition}:${offset}`),
                value: Buffer.from(JSON.stringify({ error: 'sensor-consumer-error', details: err?.issues ?? String(err), payload: raw })),
                headers: { 'content-type': 'application/json' },
              }],
            });
          } catch (e) {
            logger.error({ e }, 'dlq-send-failed');
          }
          resolveOffset(offset);
        }

        await heartbeat();
      }
    },
  });

  logger.info({ topics: [topic] }, '🟢 sensor consumer running');
}
