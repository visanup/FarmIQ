// src/consumers/sensorReadings.consumer.ts

import { consumer, producer } from '../utils/kafka';
import { tenantFilterList } from '../configs/config';
import { logger } from '../utils/logger';
import { BaseReadingSchema } from '../types/events';
import { upsertMinuteFeature } from '../stores/analyticsFeature.repo';
import { dlqTopic } from '../configs/config';

export async function runConsumers() {
  await consumer.connect();
  await producer.connect();

  await consumer.subscribe({ topic: 'sensors.device.readings', fromBeginning: false });

  await consumer.run({
    eachBatchAutoResolve: true,
    eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }) => {
      for (const message of batch.messages) {
        if (!isRunning() || isStale()) break;

        const offset = message.offset;
        try {
          const raw = message.value?.toString('utf8');
          if (!raw) { resolveOffset(offset); continue; }

          const data = JSON.parse(raw);
          const parsed = BaseReadingSchema.parse(data);

          if (tenantFilterList.length && !tenantFilterList.includes(parsed.tenant_id)) {
            resolveOffset(offset); continue;
          }

          await upsertMinuteFeature(parsed);
          resolveOffset(offset);
        } catch (err: any) {
          const raw = message.value?.toString('utf8');
          const issue = (err?.issues && Array.isArray(err.issues)) ? err.issues[0] : undefined;

          // ถ้าเป็น ZodError/invalid_date → ส่ง DLQ แล้วข้าม
          if (err?.name === 'ZodError') {
            logger.warn({ err: err.issues, raw }, 'invalid-payload -> DLQ');
            try {
              await producer.send({
                topic: dlqTopic,
                messages: [{
                  key: Buffer.from(`${batch.topic}:${batch.partition}:${offset}`),
                  value: Buffer.from(JSON.stringify({
                    error: 'zod-parse-error',
                    issues: err.issues,
                    payload: raw
                  }))
                }]
              });
            } catch (e) {
              logger.error({ e }, 'dlq-send-failed');
            }
            resolveOffset(offset); // ← ข้ามเมสเสจเสีย
          } else {
            logger.error({ err, topic: batch.topic, partition: batch.partition, offset }, 'consume-error');
            // ยังไม่ resolveOffset เพื่อให้ลองใหม่ได้ (error ชนิดอื่น)
          }
        }

        await heartbeat();
      }
    }
  });

  logger.info({ topics: ['sensors.device.readings'] }, '🟢 consumers running');
}

