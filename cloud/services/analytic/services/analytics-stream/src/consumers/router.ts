import { KafkaMessage } from 'kafkajs';
import { producer } from '../utils/kafka';
import { logger } from '../utils/logger';
import { env, dlqTopic } from '../configs/config';

import { upsertMinuteFeature } from '../stores/analyticsFeature.repo';

// measurement types
import { MeasurementSchema, Measurement, MeasurementList } from '../types/measurement';
import type { BaseReading } from '../types/events';

// mappers
import { toMeasurementFromSensor }   from '../pipelines/map/sensors';
import { toMeasurementFromHealth }   from '../pipelines/map/deviceHealth';
import { toMeasurementFromWeather }  from '../pipelines/map/weather';
import { toMeasurementsFromOps }     from '../pipelines/map/ops';
import { toMeasurementsFromFeedBatch, toMeasurementsFromFeedQuality } from '../pipelines/map/feed';
import { toMeasurementsFromEconTxn } from '../pipelines/map/econ';
import { toMeasurementFromLab }      from '../pipelines/map/lab';
import { toMeasurementFromSweep }    from '../pipelines/map/sweep';

// dimension upserts
import {
  handleDeviceSnapshot,
  handleFarmSnapshot,
  handleHouseSnapshot,
  handleFlockSnapshot,
  handleCustomerSnapshot,
  handleAnimalTypeSnapshot,
  handleBreedSnapshot,
} from '../pipelines/dimUpserts';

// analytics mappers
import {
  toMeasurementsFromFcrCalculation,
  toMeasurementsFromHealthMetrics,
  toMeasurementsFromProductionMetrics,
  toMeasurementsFromEnvironmentalMetrics,
  toMeasurementsFromSizeDistribution,
} from '../pipelines/map/analytics';

type Handler = (topic: string, message: KafkaMessage) => Promise<void>;

/** util: safe JSON.parse with small log */
function safeJson(raw: string): any {
  try {
    const obj = JSON.parse(raw);
    const keys = obj && typeof obj === 'object' ? Object.keys(obj) : [];
    console.log('✅ [ANALYTICS-STREAM] JSON parsed keys:', keys.slice(0, 10));
    if (obj && typeof obj === 'object' && 'data' in obj) {
      const inner = (obj as any).data;
      const innerKeys = inner && typeof inner === 'object' ? Object.keys(inner) : [];
      console.log('ℹ️  [ANALYTICS-STREAM] Envelope detected (.data), inner keys:', innerKeys.slice(0, 10));
    }
    return obj;
  } catch (e) {
    console.log('❌ [ANALYTICS-STREAM] JSON parse error:', e);
    throw e;
  }
}

/** generic measurement pipeline */
async function handleAsMeasurement(mapper: (o: any) => MeasurementList | any, raw: string) {
  console.log('🔍 [ANALYTICS-STREAM] Received raw data:', raw.substring(0, 200) + '...');

  let obj: any;
  try {
    obj = safeJson(raw);
  } catch (e) {
    logger.warn({ err: e, raw }, 'invalid-json -> DLQ');
    await producer.send({ topic: dlqTopic, messages: [{ value: raw }] });
    return;
  }

  let mapped: any;
  try {
    console.log('🔄 [ANALYTICS-STREAM] Applying mapper to object...');
    mapped = mapper(obj);
    console.log('✅ [ANALYTICS-STREAM] Mapper result:', Array.isArray(mapped) ? `Array(${mapped.length})` : 'Object');
  } catch (e) {
    console.log('❌ [ANALYTICS-STREAM] Mapper error:', e);
    logger.warn({ err: e, raw }, 'mapper-throw -> DLQ');
    try {
      await producer.send({
        topic: dlqTopic,
        messages: [{
          value: JSON.stringify({ reason: 'mapper-throw', error: String(e), payload: obj }),
          headers: { 'content-type': 'application/json' },
        }],
      });
    } catch (producerError) {
      console.error('❌ Failed to send mapper error to DLQ:', producerError instanceof Error ? producerError.message : String(producerError));
    }
    return;
  }

  const list: any[] = Array.isArray(mapped) ? mapped : [mapped];

  for (const it of list) {
    try {
      const m: Measurement = MeasurementSchema.parse(it);
      const br: BaseReading = {
        tenant_id: m.tenant_id,
        device_id: m.device_id,
        sensor_id: m.sensor_id ?? (m.tags?.sensor_id ?? undefined),
        metric: m.metric,
        value: m.value,
        time: m.time,
        tags: m.tags ?? undefined,
      };

      console.log('💾 [ANALYTICS-STREAM] Saving:', {
        tenant_id: br.tenant_id,
        device_id: br.device_id,
        sensor_id: br.sensor_id,
        metric: br.metric,
        value: br.value,
        time: br.time,
      });
      await upsertMinuteFeature(br);
      console.log('✅ [ANALYTICS-STREAM] Saved');
    } catch (e: any) {
      console.log('❌ [ANALYTICS-STREAM] Validation error:', e);
      logger.error({ err: e, raw: JSON.stringify(it) }, 'invalid-measurement -> DLQ');
      try {
        await producer.send({
          topic: dlqTopic,
          messages: [{
            value: JSON.stringify({ reason: 'invalid-measurement', error: e?.issues ?? String(e), payload: it }),
            headers: { 'content-type': 'application/json' },
          }],
        });
      } catch (producerError) {
        console.error('❌ Failed to send to DLQ:', producerError instanceof Error ? producerError.message : String(producerError));
        try { await producer.connect(); } catch {}
      }
    }
  }
}

/**
 * Routes: pass the FULL parsed event object to snapshot handlers.
 * Handlers will unwrap `.data` internally if present (see dimUpserts.unwrap).
 */
export const routes: Record<string, Handler> = {
  // Measurements
  [env.TOPIC_SENSORS]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleAsMeasurement(toMeasurementFromSensor, raw);
  },
  [env.TOPIC_DEVICE_HEALTH]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleAsMeasurement(toMeasurementFromHealth, raw);
  },
  [env.TOPIC_WEATHER]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleAsMeasurement(toMeasurementFromWeather, raw);
  },
  [env.TOPIC_LAB_READINGS]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleAsMeasurement(toMeasurementFromLab, raw);
  },
  [env.TOPIC_SWEEP_READINGS]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleAsMeasurement(toMeasurementFromSweep, raw);
  },
  [env.TOPIC_OPS]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleAsMeasurement(toMeasurementsFromOps, raw);
  },
  [env.TOPIC_FEED_BATCH]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleAsMeasurement(toMeasurementsFromFeedBatch, raw);
  },
  [env.TOPIC_FEED_QUALITY]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleAsMeasurement(toMeasurementsFromFeedQuality, raw);
  },
  [env.TOPIC_ECON_TXN]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleAsMeasurement(toMeasurementsFromEconTxn, raw);
  },

  // Snapshots / Dimensions (pass FULL object — handlers unwrap .data themselves)
  [env.TOPIC_DEVICE_SNAPSHOT]: async (_t, msg) => {
    const obj = safeJson(msg.value?.toString('utf8') ?? '{}');
    await handleDeviceSnapshot(obj);
  },
  [env.TOPIC_FARM_SNAPSHOT]: async (_t, msg) => {
    const obj = safeJson(msg.value?.toString('utf8') ?? '{}');
    await handleFarmSnapshot(obj);
  },
  [env.TOPIC_HOUSE_SNAPSHOT]: async (_t, msg) => {
    const obj = safeJson(msg.value?.toString('utf8') ?? '{}');
    await handleHouseSnapshot(obj);
  },
  [env.TOPIC_FLOCK_SNAPSHOT]: async (_t, msg) => {
    const obj = safeJson(msg.value?.toString('utf8') ?? '{}');
    await handleFlockSnapshot(obj);
  },

  // Master Service Snapshots — SAME handling (pass full event)
  [env.TOPIC_MASTER_CUSTOMER]: async (_t, msg) => {
    const obj = safeJson(msg.value?.toString('utf8') ?? '{}');
    await handleCustomerSnapshot(obj);
  },
  [env.TOPIC_MASTER_DEVICE]: async (_t, msg) => {
    const obj = safeJson(msg.value?.toString('utf8') ?? '{}');
    await handleDeviceSnapshot(obj);
  },
  [env.TOPIC_MASTER_FARM]: async (_t, msg) => {
    const obj = safeJson(msg.value?.toString('utf8') ?? '{}');
    await handleFarmSnapshot(obj);
  },
  [env.TOPIC_MASTER_HOUSE]: async (_t, msg) => {
    const obj = safeJson(msg.value?.toString('utf8') ?? '{}');
    await handleHouseSnapshot(obj);
  },
  [env.TOPIC_MASTER_FLOCK]: async (_t, msg) => {
    const obj = safeJson(msg.value?.toString('utf8') ?? '{}');
    await handleFlockSnapshot(obj);
  },
  [env.TOPIC_MASTER_ANIMAL_TYPE]: async (_t, msg) => {
    const obj = safeJson(msg.value?.toString('utf8') ?? '{}');
    await handleAnimalTypeSnapshot(obj);
  },
  [env.TOPIC_MASTER_BREED]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    console.log('📦 [BREED] raw:', raw.slice(0, 300));
    const obj = safeJson(raw);
    await handleBreedSnapshot(obj); // pass FULL event; handler unwraps .data
    },

  // Analytics calculated topics
  [env.TOPIC_ANALYTICS_FCR]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleAsMeasurement(toMeasurementsFromFcrCalculation, raw);
  },
  [env.TOPIC_ANALYTICS_HEALTH]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleAsMeasurement(toMeasurementsFromHealthMetrics, raw);
  },
  [env.TOPIC_ANALYTICS_PRODUCTION]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleAsMeasurement(toMeasurementsFromProductionMetrics, raw);
  },
  [env.TOPIC_ANALYTICS_ENVIRONMENTAL]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleAsMeasurement(toMeasurementsFromEnvironmentalMetrics, raw);
  },
  [env.TOPIC_ANALYTICS_SIZE]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleAsMeasurement(toMeasurementsFromSizeDistribution, raw);
  },
};

export async function dispatch(topic: string, message: KafkaMessage) {
  const h = routes[topic];
  if (!h) {
    logger.warn({ topic }, 'no-handler-for-topic');
    return;
  }
  await h(topic, message);
}
