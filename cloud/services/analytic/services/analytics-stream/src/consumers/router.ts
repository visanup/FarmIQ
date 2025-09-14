// src/consumers/router.ts

import { KafkaMessage } from 'kafkajs';
import { producer } from '../utils/kafka';
import { logger } from '../utils/logger';
import { env, dlqTopic } from '../configs/config';

import { upsertMinuteFeature } from '../stores/analyticsFeature.repo';

// ใช้ type & schema กลาง
import { MeasurementSchema, Measurement, MeasurementList } from '../types/measurement';
import type { BaseReading } from '../types/events';

// --- mappers ---
import { toMeasurementFromSensor }   from '../pipelines/map/sensors';
import { toMeasurementFromHealth }   from '../pipelines/map/deviceHealth';
import { toMeasurementFromWeather }  from '../pipelines/map/weather';
import { toMeasurementsFromOps }     from '../pipelines/map/ops';
import { toMeasurementsFromFeedBatch, toMeasurementsFromFeedQuality } from '../pipelines/map/feed';
import { toMeasurementsFromEconTxn } from '../pipelines/map/econ';
import { toMeasurementFromLab }      from '../pipelines/map/lab';
import { toMeasurementFromSweep }    from '../pipelines/map/sweep';

// --- dimension upserts (snapshots) ---
import {
  handleDeviceSnapshot,
  handleFarmSnapshot,
  handleHouseSnapshot,
  handleFlockSnapshot,
  handleCustomerSnapshot,
  handleAnimalTypeSnapshot,
  handleBreedSnapshot,
} from '../pipelines/dimUpserts';

// --- analytics mappers ---
import {
  toMeasurementsFromFcrCalculation,
  toMeasurementsFromHealthMetrics,
  toMeasurementsFromProductionMetrics,
  toMeasurementsFromEnvironmentalMetrics,
  toMeasurementsFromSizeDistribution
} from '../pipelines/map/analytics';

type Handler = (topic: string, message: KafkaMessage) => Promise<void>;

/**
 * รับ mapper ใด ๆ -> คืนค่า Measurement[] (validate + normalize)
 * - ถ้า JSON พัง / mapper พัง / validation พัง -> ส่งเข้า DLQ พร้อมเหตุผล
 */
async function handleAsMeasurement(mapper: (o: any) => MeasurementList | any, raw: string) {
  console.log('🔍 [ANALYTICS-STREAM] Received raw data:', raw.substring(0, 200) + '...');
  
  // 1) parse JSON
  let obj: any;
  try {
    obj = JSON.parse(raw);
    console.log('✅ [ANALYTICS-STREAM] JSON parsed successfully:', Object.keys(obj));
  } catch (e) {
    console.log('❌ [ANALYTICS-STREAM] JSON parse error:', e);
    logger.warn({ err: e, raw }, 'invalid-json -> DLQ');
    await producer.send({ topic: dlqTopic, messages: [{ value: raw }] });
    return;
  }

  // 2) map → measurement(s)
  let mapped: any;
  try {
    console.log('🔄 [ANALYTICS-STREAM] Applying mapper to object...');
    mapped = mapper(obj);
    console.log('✅ [ANALYTICS-STREAM] Mapper result:', Array.isArray(mapped) ? `Array with ${mapped.length} items` : 'Single object');
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
  if (!mapped) return;

  const list: any[] = Array.isArray(mapped) ? mapped : [mapped];

  // 3) validate + แปลงให้ตรงกับ BaseReading ที่ upsert ใช้
  for (const it of list) {
    try {
      const m: Measurement = MeasurementSchema.parse(it);

      // BaseReading ที่ repo ต้องการ (รองรับ sensor_id optional)
      const br: BaseReading = {
        tenant_id: m.tenant_id,
        device_id: m.device_id,
        sensor_id: m.sensor_id ?? (m.tags?.sensor_id ?? undefined),
        metric: m.metric,
        value: m.value,
        time: m.time,
        tags: m.tags ?? undefined,
      };

      console.log('💾 [ANALYTICS-STREAM] Saving to database:', {
        tenant_id: br.tenant_id,
        device_id: br.device_id,
        sensor_id: br.sensor_id,
        metric: br.metric,
        value: br.value,
        time: br.time
      });
      await upsertMinuteFeature(br);
      console.log('✅ [ANALYTICS-STREAM] Successfully saved to database');
    } catch (e: any) {
      console.log('❌ [ANALYTICS-STREAM] Validation error:', e);
      logger.error({ err: e, raw: JSON.stringify(it) }, 'invalid-measurement -> DLQ');
      try {
        await producer.send({
          topic: dlqTopic,
          messages: [{
            value: JSON.stringify({
              reason: 'invalid-measurement',
              error: e?.issues ?? String(e),
              payload: it,
            }),
            headers: { 'content-type': 'application/json' },
          }],
        });
      } catch (producerError) {
        console.error('❌ Failed to send to DLQ, producer may be disconnected:', producerError instanceof Error ? producerError.message : String(producerError));
        // Try to reconnect producer
        try {
          await producer.connect();
          console.log('✅ Producer reconnected successfully');
        } catch (reconnectError) {
          console.error('❌ Failed to reconnect producer:', reconnectError instanceof Error ? reconnectError.message : String(reconnectError));
        }
      }
    }
  }
}

/** ตารางเส้นทาง topic → handler */
export const routes: Record<string, Handler> = {
  // --- Sensors/Health/Weather (single measurement) ---
  [env.TOPIC_SENSORS]: async (_t, msg) => {
    console.log('📡 [ANALYTICS-STREAM] Processing SENSORS topic message');
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

  // --- Edge (lab/sweep) ---
  [env.TOPIC_LAB_READINGS]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleAsMeasurement(toMeasurementFromLab, raw);
  },
  [env.TOPIC_SWEEP_READINGS]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleAsMeasurement(toMeasurementFromSweep, raw);
  },

  // --- Multi-measurement mappers ---
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

  // --- Snapshots / Dimensions (ไม่เขียน minute features) ---
  [env.TOPIC_DEVICE_SNAPSHOT]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleDeviceSnapshot(JSON.parse(raw));
  },
  [env.TOPIC_FARM_SNAPSHOT]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleFarmSnapshot(JSON.parse(raw));
  },
  [env.TOPIC_HOUSE_SNAPSHOT]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleHouseSnapshot(JSON.parse(raw));
  },
  [env.TOPIC_FLOCK_SNAPSHOT]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleFlockSnapshot(JSON.parse(raw));
  },
  
  // --- Master Service Snapshots ---
  [env.TOPIC_MASTER_CUSTOMER]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    const data = JSON.parse(raw);
    await handleCustomerSnapshot(data.data); // Master service wraps data in .data
  },
  [env.TOPIC_MASTER_DEVICE]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    const data = JSON.parse(raw);
    await handleDeviceSnapshot(data.data); // Master service wraps data in .data
  },
  [env.TOPIC_MASTER_FARM]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    const data = JSON.parse(raw);
    await handleFarmSnapshot(data.data); // Master service wraps data in .data
  },
  [env.TOPIC_MASTER_HOUSE]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    const data = JSON.parse(raw);
    await handleHouseSnapshot(data.data); // Master service wraps data in .data
  },
  [env.TOPIC_MASTER_FLOCK]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    const data = JSON.parse(raw);
    await handleFlockSnapshot(data.data); // Master service wraps data in .data
  },
  [env.TOPIC_MASTER_ANIMAL_TYPE]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    const data = JSON.parse(raw);
    await handleAnimalTypeSnapshot(data.data); // Master service wraps data in .data
  },
  [env.TOPIC_MASTER_BREED]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    const data = JSON.parse(raw);
    await handleBreedSnapshot(data.data); // Master service wraps data in .data
  },

  // --- Analytics Topics ---
  [env.TOPIC_ANALYTICS_FCR]: async (_t, msg) => {
    console.log('🐄 [ANALYTICS-STREAM] Processing FCR calculation message');
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleAsMeasurement(toMeasurementsFromFcrCalculation, raw);
  },
  
  [env.TOPIC_ANALYTICS_HEALTH]: async (_t, msg) => {
    console.log('🏥 [ANALYTICS-STREAM] Processing Health metrics message');
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleAsMeasurement(toMeasurementsFromHealthMetrics, raw);
  },
  
  [env.TOPIC_ANALYTICS_PRODUCTION]: async (_t, msg) => {
    console.log('🥚 [ANALYTICS-STREAM] Processing Production metrics message');
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleAsMeasurement(toMeasurementsFromProductionMetrics, raw);
  },
  
  [env.TOPIC_ANALYTICS_ENVIRONMENTAL]: async (_t, msg) => {
    console.log('🌡️ [ANALYTICS-STREAM] Processing Environmental metrics message');
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleAsMeasurement(toMeasurementsFromEnvironmentalMetrics, raw);
  },
  
  [env.TOPIC_ANALYTICS_SIZE]: async (_t, msg) => {
    console.log('📏 [ANALYTICS-STREAM] Processing Size distribution message');
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleAsMeasurement(toMeasurementsFromSizeDistribution, raw);
  },

  // Note: PREDICTIONS and ANOMALIES topics will be handled by dedicated services
  // as they require more complex processing than simple measurements
};

/** dispatcher กลาง */
export async function dispatch(topic: string, message: KafkaMessage) {
  const h = routes[topic];
  if (!h) {
    logger.warn({ topic }, 'no-handler-for-topic');
    return;
  }
  await h(topic, message);
}