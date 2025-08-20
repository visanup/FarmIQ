สุดยอด—ภาพรวมมันชัดเลยว่า **analytics-stream** ต้อง “กินหลายโดเมน” ไม่ใช่แค่ sensor แล้วแปลงให้เป็น feature ที่รวมศูนย์ได้ในที่เดียว โดยไม่พังเรื่องสเกล/สคีมา ผมสรุปแนวทาง+สเกโค้ดให้ครบมือเลย

---

# แนวทางออกแบบให้รองรับหลายโดเมน

## 0) หลักคิด

1. **แยกชนิดเหตุการณ์เป็น 2 กลุ่ม**

   * **Time-series Measurement** → แปลงเป็นรูปแบบกลาง (canonical) แล้ว `UPSERT` เข้า `analytics_minute_features` เหมือนเดิม
     *ตัวอย่าง*: SENSORS, DEVICE\_HEALTH, WEATHER, OPS(นับ event/min)
   * **Dimension / Snapshot / Metadata** → อัปเดตตารางมิติ (dim) หรือ Redis เพื่อใช้ enrich ตอนทำ feature
     *ตัวอย่าง*: DEVICE\_SNAPSHOT, FARM\_SNAPSHOT, HOUSE\_SNAPSHOT, FLOCK\_SNAPSHOT, FORMULA
2. **Routing ตาม topic → handler** (plug-in)
   Consumer ตัวเดียว subscribe ได้หลาย topic แล้ว *dispatch* ไปยัง handler เฉพาะโดเมน
3. **Canonical Measurement** เดียวสำหรับทุกโดเมน

   ```ts
   { tenant_id, device_id/*หรือ entity_id*/, metric, value, time, tags? }
   ```

   ช่วยให้ pipeline aggregate (minute → 5m → 1h) ใช้ซ้ำได้กับทุกโดเมน
4. **Idempotent + DLQ** เหมือนเดิม (เราใส่แล้ว): ข้อมูลแปลก/สคีมาเพี้ยน → ส่ง DLQ พร้อม payload/raw

---

## 1) กำหนด Topics (env)

> คุณมีรายการชัดเจนแล้ว—แนะนำประกาศใน `.env` และ set `KAFKA_TOPICS_IN` เป็น comma-separated รวมทุกตัว

```env
TOPIC_SENSORS=sensors.device.readings.v1
TOPIC_DEVICE_HEALTH=sensors.device.health.v1
TOPIC_DEVICE_SNAPSHOT=devices.device.snapshot.v1
TOPIC_FARM_SNAPSHOT=farms.farm.snapshot.v1
TOPIC_HOUSE_SNAPSHOT=farms.house.snapshot.v1
TOPIC_FLOCK_SNAPSHOT=farms.flock.snapshot.v1
TOPIC_OPS=farms.operational.event.v1
TOPIC_FEED_BATCH=feed.batch.created.v1
TOPIC_FEED_QUALITY=feed.quality.result.v1
TOPIC_FORMULA=formula.recipe.snapshot.v1
TOPIC_ECON_TXN=economics.cost.txn.v1
TOPIC_WEATHER=external.weather.observation.v1
TOPIC_FEATURES=analytics.features.materialized.v1
TOPIC_PREDICTIONS=analytics.prediction.v1
TOPIC_ANOMALIES=analytics.anomaly.v1

# ใช้ตัวบนมารวมเป็น IN
KAFKA_TOPICS_IN=${TOPIC_SENSORS},${TOPIC_DEVICE_HEALTH},${TOPIC_DEVICE_SNAPSHOT},${TOPIC_FARM_SNAPSHOT},${TOPIC_HOUSE_SNAPSHOT},${TOPIC_FLOCK_SNAPSHOT},${TOPIC_OPS},${TOPIC_FEED_BATCH},${TOPIC_FEED_QUALITY},${TOPIC_FORMULA},${TOPIC_ECON_TXN},${TOPIC_WEATHER}
KAFKA_TOPIC_OUT=${TOPIC_FEATURES}
KAFKA_TOPIC_DLQ=analytics.invalid-readings
```

แล้วใน `config.ts` ใส่ fields เหล่านี้ (มี default ตามที่คุณประกาศ) และ **คง `inputTopics` เดิม** (split จาก `KAFKA_TOPICS_IN`)

---

## 2) Router: map topic → handler

`src/consumers/router.ts`

```ts
import { z } from 'zod';
import { upsertMinuteFeature } from '../stores/analyticsFeature.repo';
import { logger } from '../utils/logger';
import { env } from '../configs/config';
import { KafkaMessage } from 'kafkajs';
import {
  handleDeviceSnapshot, handleFarmSnapshot, handleHouseSnapshot, handleFlockSnapshot
} from '../pipelines/dimUpserts';
import { toMeasurementFromSensor }   from '../pipelines/map/sensors';
import { toMeasurementFromHealth }   from '../pipelines/map/deviceHealth';
import { toMeasurementFromWeather }  from '../pipelines/map/weather';
import { toMeasurementFromOps }      from '../pipelines/map/ops';
import { toMeasurementFromFeed }     from '../pipelines/map/feed';
import { toMeasurementFromEconTxn }  from '../pipelines/map/econ';

type Handler = (topic: string, message: KafkaMessage) => Promise<void>;

async function handleAsMeasurement(mapper: (o:any)=>{
  tenant_id: string; device_id: string; metric: string; value: number; time: Date; tags?: Record<string,string>
} | null, raw: string) {
  const obj = JSON.parse(raw);
  const m = mapper(obj);
  if (!m) return;                   // ไม่เข้าเงื่อนไขก็ข้าม
  await upsertMinuteFeature(m);
}

export const routes: Record<string, Handler> = {
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
  [env.TOPIC_OPS]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleAsMeasurement(toMeasurementFromOps, raw);
  },
  [env.TOPIC_FEED_BATCH]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleAsMeasurement(toMeasurementFromFeed, raw);
  },
  [env.TOPIC_ECON_TXN]: async (_t, msg) => {
    const raw = msg.value?.toString('utf8') ?? '{}';
    await handleAsMeasurement(toMeasurementFromEconTxn, raw);
  },

  // --- Snapshots / Dimensions ---
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

export async function dispatch(topic: string, message: KafkaMessage) {
  const h = routes[topic];
  if (!h) {
    logger.warn({ topic }, 'no-handler-for-topic');
    return;
  }
  await h(topic, message);
}
```

แล้วใน consumer หลัก เรียก `dispatch(batch.topic, message)` แทนการ parse แบบเดิม

---

## 3) Mapper ต่อโดเมน (ตัวอย่าง)

### 3.1 Sensors → Canonical

`src/pipelines/map/sensors.ts`

```ts
import { z } from 'zod';
import { normalizeTime } from './time'; // ใช้อัน robust เดิมของคุณ

const SensorSchema = z.object({
  tenant_id: z.string().min(1),
  device_id: z.string().min(1),
  sensor_id: z.string().optional(),
  metric: z.string().min(1),
  value: z.number().finite(),
  time: normalizeTime.optional(),
  ts:   normalizeTime.optional(),
  tags: z.record(z.string()).optional()
});

export function toMeasurementFromSensor(o: any) {
  const d = SensorSchema.parse(o);
  const time = (d.time ?? d.ts)!;
  return {
    tenant_id: d.tenant_id,
    device_id: d.device_id,
    metric: `sensor.${d.metric}`,  // ✅ ตั้ง namespace ให้ชัด
    value: d.value,
    time,
    tags: d.tags
  };
}
```

### 3.2 Device Health → uptime/error rate ต่อ 1 นาที

`src/pipelines/map/deviceHealth.ts`

```ts
import { z } from 'zod';
import { normalizeTime } from './time';

const HealthSchema = z.object({
  tenant_id: z.string(), device_id: z.string(),
  status: z.enum(['up','down','degraded']),
  time: normalizeTime
});

export function toMeasurementFromHealth(o:any) {
  const d = HealthSchema.parse(o);
  const value = d.status === 'up' ? 1 : 0;  // ตัวอย่าง: uptime ratio
  return {
    tenant_id: d.tenant_id,
    device_id: d.device_id,
    metric: 'device.health.up',
    value,
    time: d.time
  };
}
```

### 3.3 Weather → map เป็น metric ตามสถานี/ฟาร์ม

`src/pipelines/map/weather.ts`

```ts
import { z } from 'zod';
import { normalizeTime } from './time';

const WeatherSchema = z.object({
  tenant_id: z.string(),        // หรือ 'global'
  station_id: z.string(),
  obs_time: normalizeTime,      // ชื่อ field ภายนอก
  temp_c: z.number().optional(),
  rh: z.number().optional(),
});

export function toMeasurementFromWeather(o:any) {
  const d = WeatherSchema.parse(o);
  if (typeof d.temp_c === 'number') {
    return {
      tenant_id: d.tenant_id,
      device_id: d.station_id,  // ใช้ station เป็น entity
      metric: 'weather.temp_c',
      value: d.temp_c,
      time: d.obs_time
    };
  }
  return null;
}
```

### 3.4 OPS / FEED / ECON (ตัวอย่าง)

หลักการเหมือนกัน: แปลงให้เป็น `metric` ที่สื่อความหมาย

* OPS: `ops.event.<type>` = 1 (นับจำนวน event/min)
* FEED\_BATCH: `feed.batch_kg` = `weight_kg`
* FEED\_QUALITY: `feed.aflatoxin_ppb` ฯลฯ
* ECON\_TXN: ถ้าจะรวมรายวัน แนะนำ *อีก service* ทำ daily bucket; แต่ถ้าต้องการนาทีจริง ๆ ก็ map `value=amount` แล้วให้ `continuous aggregates` ระดับวัน/ชั่วโมงไปสรุป

---

## 4) Dimensions / Snapshots

สร้างตารางมิติแบบบาง (ใช้เพื่อ enrich หรือ mapping entity):

* `dim.device (device_id, tenant_id, farm_id, house_id, ... , updated_at)`
* `dim.farm   (farm_id, tenant_id, name, geo, ... , updated_at)`
* `dim.house  (house_id, farm_id, tenant_id, ... , updated_at)`
* `dim.flock  (flock_id, house_id, ... , updated_at)`

> จะทำ SCD2 ก็ได้ แต่เวอร์ชันแรกเก็บ “latest” พอ

`src/pipelines/dimUpserts.ts` (ตัวอย่าง device)

```ts
import { z } from 'zod';
import { AppDataSource } from '../utils/dataSource';

const DeviceSnap = z.object({
  tenant_id: z.string(),
  device_id: z.string(),
  farm_id: z.string().optional(),
  house_id: z.string().optional(),
  meta: z.record(z.unknown()).optional(),
  updated_at: z.coerce.date().optional()
});

export async function handleDeviceSnapshot(o:any) {
  const d = DeviceSnap.parse(o);
  await AppDataSource.query(`
    INSERT INTO analytics.dim_device
      (tenant_id, device_id, farm_id, house_id, meta, updated_at)
    VALUES ($1,$2,$3,$4,$5, COALESCE($6, now()))
    ON CONFLICT (tenant_id, device_id) DO UPDATE SET
      farm_id=EXCLUDED.farm_id,
      house_id=EXCLUDED.house_id,
      meta=EXCLUDED.meta,
      updated_at=EXCLUDED.updated_at;
  `, [d.tenant_id, d.device_id, d.farm_id ?? null, d.house_id ?? null, d.meta ?? {}, d.updated_at ?? null]);
}
```

> ทำไฟล์ migration เพิ่มเติมเพื่อสร้าง `dim_*` เหล่านี้

---

## 5) ปรับ Consumer ให้ route

`src/consumers/sensorReadings.consumer.ts` → เปลี่ยนชื่อเป็น `multiTopic.consumer.ts` แล้วใช้ `dispatch`:

```ts
import { consumer, producer } from '../utils/kafka';
import { inputTopics } from '../configs/config';
import { dispatch } from './router';
import { logger } from '../utils/logger';

export async function runConsumers() {
  await consumer.connect();
  await producer.connect();

  for (const t of inputTopics) {
    await consumer.subscribe({ topic: t, fromBeginning: false });
  }

  await consumer.run({
    eachBatchAutoResolve: true,
    eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }) => {
      for (const message of batch.messages) {
        if (!isRunning() || isStale()) break;
        try {
          await dispatch(batch.topic, message);
          resolveOffset(message.offset);
        } catch (err:any) {
          // logic DLQ ของคุณที่ทำไว้แล้ว
          // ... ส่ง DLQ + resolveOffset สำหรับ ZodError
        }
        await heartbeat();
      }
    }
  });

  logger.info({ topics: inputTopics }, '🟢 consumers running (multi-topic)');
}
```

---

## 6) ชื่อ metric (ข้อตกลง)

ใช้ namespace ให้บอกโดเมนชัด เช่น:

* `sensor.temp`, `sensor.humidity`
* `device.health.up`, `device.health.error`
* `weather.temp_c`, `weather.rh`
* `ops.event.<EVENT_NAME>`
* `feed.batch_kg`, `feed.quality.aflatoxin_ppb`
* `econ.txn.amount_thb`

> ทำ enum/constant ไว้ที่ `src/types/metrics.ts` เพื่อลดสะกดผิด

---

## 7) Partitioning & Scaling

* **Key** สำหรับ time-series ให้ใช้ entity หลัก เช่น `device_id` (หรือ `farm_id` สำหรับ weather per farm) → เพื่อให้ ordering ต่อ entity คงอยู่
* **Consumer group** ให้ตัวเดียว แต่ **scale** ได้โดยเพิ่มจำนวน instance (Kafka จะกระจาย partitions ให้)
* **DLQ แยก/รวม**: จะใช้ DLQ เดียวก็พอ แต่ใส่ฟิลด์ `source_topic` และ `offset` ใน payload เพื่อ debug ง่าย

---

## 8) Continuous Aggregates เพิ่มเติม (ภายหลัง)

ถ้าบาง metric เหมาะกับ window อื่น (เช่น daily สำหรับเศรษฐกิจ) ให้สร้าง view/policy เพิ่ม:

* `analytics_15m`, `analytics_1d` ฯลฯ
* หรือทำใน service `analytics-worker` เฉพาะกิจ—ดีตอนคำนวณซับซ้อน (rolling window / joins หลายตาราง)

---

## 9) Observability

* ใส่ Prometheus metrics ง่าย ๆ (`prom-client` มีแล้ว) เช่น:

  * `stream_messages_total{topic=...}`
  * `stream_dlq_total{topic=...,reason=...}`
  * `stream_batch_duration_ms`
* health endpoints: `/health`, `/ready`

---

## 10) เช็กลิสต์ทำจริง

1. เติม env topics + รวม `KAFKA_TOPICS_IN`
2. เพิ่ม `router.ts` + mappers + dim upserts
3. Migration: ตารางมิติ (`dim_device`, `dim_farm`, …)
4. เปลี่ยน consumer หลักให้เรียก `dispatch`
5. ทดสอบทีละ topic → ดูตาราง minute + views + DLQ
6. เปิด Kafka-UI/RedisInsight ช่วยส่อง

---

อยากให้ผมร่างไฟล์ migration ของ `dim_*` และสเกล schema zod สำหรับ feeds/econ/ops แบบเต็ม ๆ ต่อไหม? เดี๋ยวผมใส่ให้ครบทั้งโครงพร้อมตัวอย่าง payload จริงแล้วคุณค่อยเติม field เพิ่มได้ตามโดเมนเลย 💪
