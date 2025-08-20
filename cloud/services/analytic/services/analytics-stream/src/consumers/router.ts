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
} from '../pipelines/dimUpserts';

type Handler = (topic: string, message: KafkaMessage) => Promise<void>;

/**
 * รับ mapper ใด ๆ -> คืนค่า Measurement[] (validate + normalize)
 * - ถ้า JSON พัง / mapper พัง / validation พัง -> ส่งเข้า DLQ พร้อมเหตุผล
 */
async function handleAsMeasurement(mapper: (o: any) => MeasurementList | any, raw: string) {
  // 1) parse JSON
  let obj: any;
  try {
    obj = JSON.parse(raw);
  } catch (e) {
    logger.warn({ err: e, raw }, 'invalid-json -> DLQ');
    await producer.send({ topic: dlqTopic, messages: [{ value: raw }] });
    return;
  }

  // 2) map → measurement(s)
  let mapped: any;
  try {
    mapped = mapper(obj);
  } catch (e) {
    logger.warn({ err: e, raw }, 'mapper-throw -> DLQ');
    await producer.send({
      topic: dlqTopic,
      messages: [{
        value: JSON.stringify({ reason: 'mapper-throw', error: String(e), payload: obj }),
        headers: { 'content-type': 'application/json' },
      }],
    });
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

      await upsertMinuteFeature(br);
    } catch (e: any) {
      logger.error({ err: e, raw: JSON.stringify(it) }, 'invalid-measurement -> DLQ');
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
    }
  }
}

/** ตารางเส้นทาง topic → handler */
export const routes: Record<string, Handler> = {
  // --- Sensors/Health/Weather (single measurement) ---
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