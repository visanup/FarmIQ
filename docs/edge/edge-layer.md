# FarmIQ Edge Layer — MQTT Contracts & Service Map

> เอกสารนี้สรุปสัญญา (contracts) ของ MQTT ฝั่ง Edge ตามที่โค้ดในโฟลเดอร์ `edge/` ใช้อยู่จริง พร้อมเทียบกับสเปก topic ในเอกสารคลาวด์ `docs/cloud/mqtt-topics.md` และเสนอแนวทาง mapping/ปรับปรุงให้สอดคล้องกัน

---

## ภาพรวมสถาปัตยกรรม (Edge)
- Broker: Mosquitto (`edge/mosquitto`)
- Services หลัก (Fastify + Prisma + TimescaleDB):
  - sensor-service (6300), edge-orchestrator-service (6301), sync-service (6302), weight-associator-service (6303), images-ingestion-service (6304), edge-topic-bridge (6305)
  - บางบริการยังเป็น placeholder เช่น robot-bridge, zone-mapper-service, device-health-service, ฯลฯ
- ที่เก็บไฟล์สื่อ: MinIO (bucket RAW/DATASETS/MODELS)

---

## สรุป Topic ที่โค้ดใช้อยู่จริง (ปัจจุบัน)
หมายเหตุ: หลายบริการใช้ “routing key แบบจุด” แล้วแปลงเป็น MQTT ด้วย `/` ภายในโค้ด (เช่น `image.created` -> topic `image/created`).

1) images-ingestion-service
- หลังอัปโหลดสื่อเข้า MinIO จะ publish อีเวนต์: `image.created` (แปลงเป็น `image/created`)
- อ้างอิง: `edge/services/images-ingestion-service/src/utils/mqtt.ts`, `.../src/services/media.service.ts`
- Payload ใส่ข้อมูล `tenant_id, robot_id|station_id, sensor_id, metric, media_id, sha256, time, width, height, objectKey`

2) weight-associator-service
- Subscribe: `image.created` -> จับคู่กับ readings น้ำหนักใน DB ภายในหน้าต่างเวลา (ค่าเริ่มต้น 5 วินาที)
- Publish: `weight.associated` (แปลงเป็น `weight/associated`) ระบุ `media_id, reading_id, weight, delta_ms, time`
- อ้างอิง: `edge/services/weight-associator-service/src/configs/config.ts`, `.../src/server.ts`, `.../src/utils/mqtt.ts`

3) sensor-service
- Subscribe (input RAW): `sensor.raw/{tenant}/{metric}/{deviceId}` (ค่าเริ่มต้นจาก ENV `SENSOR_RAW_SUB`)
- Publish (output namespaces):
  - `sensor.clean/{tenant}/{metric}/{deviceId}`
  - `sensor.anomaly/{tenant}/{metric}/{deviceId}`
  - (ทางเลือก) `sensor.dlq/...`
- Device Management: รับ `dm/{tenant}/{deviceId}/health` และ `dm/{tenant}/{deviceId}/lwt` แล้วบันทึก `device_health`
- เขียน DB: `sweep_readings` (เมื่อมี run/sensor context) หรือ `fn_ingest_device_reading()`
- อ้างอิง: `edge/services/sensor-service/src/server.ts`, `.../src/configs/config.ts`, `.../src/utils/mqtt.ts`

4) edge-orchestrator-service
- Publish เพื่อบอกสถานะงานภายใน: `edge/datasets/ready`, `edge/model/deploy.done`
- อ้างอิง: `edge/services/edge-orchestrator-service/src/services/dataset.service.ts`, `.../model-intake.service.ts`

5) Mosquitto ACL (ตัวอย่าง)
- ระบุสิทธิ์สำหรับ service accounts: `edge_image_ingest` (write `image/created`), `edge_sensor_svc` (read `sensor.raw/#`, write `sensor.clean/#` ฯลฯ)
- อ้างอิง: `edge/mosquitto/config/aclfile`

สังเกตความต่างจากสเปกคลาวด์: โค้ดใน Edge ยังไม่ได้ใช้ prefix `edge/tele|evt|cmd|stat|cfg|dlq` และยังไม่ได้ใส่มิติ `{house}`, `{station}` ไว้ในชื่อ topic (ส่วนใหญ่แนบใน payload แทน)

---

## สเปกฝั่งคลาวด์ (สรุปจาก docs/cloud/mqtt-topics.md)
- Prefix: `edge/`
- กลุ่มหลัก: `tele` (Telemetry), `evt` (Events), `cmd` (Commands), `stat` (Status/LWT), `cfg` (Config retained), `dlq` (Dead-letter)
- ตัวอย่างสำคัญ:
  - Telemetry (Lab): `edge/tele/{tenant}/{house}/lab/{station}/env/{sensor_id}/{metric}`
  - Telemetry (Robot/Run): `edge/tele/{tenant}/{house}/robot/{robot_id}/run/{run_id}/{sensor_id}/{metric}`
  - Event: image stored `edge/evt/{tenant}/{house}/.../camera/{cam_id}/stored`
  - Event: weigh finalized `edge/evt/{tenant}/{house}/.../weigh/finalized`
  - Status/LWT: `edge/stat/{tenant}/{house}/{device_type}/{device_id}` (retained)
  - Command: `edge/cmd/{tenant}/{house}/...`

---

## Mapping ที่แนะนำ (Edge → Cloud Spec)
เพื่อให้สอดคล้องกับเอกสารคลาวด์ โดยยังคงความเรียบง่ายใน Edge มี 2 แนวทางที่เลือกใช้ได้ร่วมกัน:
- A) ปรับบริการให้ publish/subscribe ตาม prefix `edge/` โดยตรง
- B) เพิ่ม “Edge Topic Bridge” (บริการแปลหัวข้อ) ที่ subscribe หัวข้อภายใน แล้ว re-publish เป็นหัวข้อ `edge/...` ไปยัง broker เดิมหรือตัวที่ bridge ไป Cloud/Kafka

ตาราง mapping หลักที่แนะนำ:
- `sensor.clean/{tenant}/{metric}/{deviceId}` →
  - Commercial (มี run): `edge/tele/{tenant}/{house}/robot/{deviceId}/run/{run_id}/{sensor_id}/{metric}`
  - Lab: `edge/tele/{tenant}/{house}/lab/{station}/env/{sensor_id}/{metric}`
  - หมายเหตุ: กรณี `{house},{station},{run_id}` ไม่อยู่ใน topic ดั้งเดิม ให้เติมจาก payload/DB ก่อน re-publish
- `sensor.anomaly/...` → `edge/evt/{tenant}/{house}/alert/{alert_type}` หรือ `edge/dlq/...` ตามประเภท
- `dm/{tenant}/{deviceId}/health|lwt` → `edge/stat/{tenant}/{house}/{device_type}/{deviceId}` (retained); สถานะ LWT ควร publish `online:false`
- `image/created` → `edge/evt/{tenant}/{house}/{scope}/camera/{cam_id}/stored` พร้อม `media_id`, `bucket`, `object_key`, `sha256`
- `weight/associated` → `edge/evt/{tenant}/{house}/{scope}/weigh/finalized` พร้อม `media_id`, `weight_kg`, `t_weight`, `strategy`, `match_window_ms`
- `edge/datasets/ready` → คง prefix `edge/evt/.../dataset/ready` (หรือส่งตรง REST → Cloud แล้วให้ Cloud publish ต่อ)
- ค่าปริยาย QoS: ใช้ QoS 1; retain เฉพาะ `cfg`, `stat` (LWT/status)

ตัวอย่างกติกาเติม context ก่อน re-publish:
- เติม `{house}` จาก station/robot registry ใน Edge DB
- สร้าง/ส่ง `session_id` ทุกครั้งเมื่อเป็น flow ที่ต้อง associate (ภาพ/น้ำหนัก)

---

## Edge → Cloud (REST via sync-service)
`sync-service` จะส่ง batch ไป Cloud `sensor-streamer-service` (พอร์ต 7302) ผ่าน REST ตามสคีม่า:
- `POST /sweep-readings`
- `POST /lab-readings`
- `POST /sensor-readings`
- `POST /device-health`

- Telemetry: Lab
  - จาก `edge/tele/{tenant}/{house}/lab/{station}/env/{sensor}/{metric}`
  - ไป Kafka: `sensors.lab.readings.v1`
  - Data หลัก: `{tenantId, houseId, stationId, sensorId, metric, value, unit?, ts, quality?, location?}`

- Telemetry: Robot/Run (Commercial sweep)
  - จาก `edge/tele/{tenant}/{house}/robot/{robot}/run/{run}/{sensor}/{metric}`
  - ไป Kafka: `sensors.sweep.readings.v1`
  - ใส่ `robotId, runId, zoneId?, x?, y?` เพิ่มเติมเพื่อใช้งาน analytics

- Device Health / LWT
  - จาก `edge/stat/{tenant}/{house}/{device_type}/{device_id}` (retained; แต่ออก batch ไป Kafka แบบ non-retained)
  - ไป Kafka: `sensors.device.health.v1`
  - Normalize คีย์: `{tenantId, houseId, deviceId, online, rssi?, uptimeS?, ts}`

- Weight Finalized (ถือเป็น reading แบบยืนยันแล้ว)
  - จาก `edge/evt/.../weigh/finalized`
  - ไป Kafka: `sensors.lab.readings.v1` (Lab) หรือ `sensors.sweep.readings.v1` (Commercial)
  - Map เป็น reading metric=`WEIGHT` และแนบ `mediaId`, `strategy`, `matchWindowMs`

- Image Stored
  - จาก `edge/evt/.../camera/{cam}/stored`
  - ไม่บังคับต้องส่ง Kafka ในทุกกรณี; หากต้องการ audit/ML pipeline เสนอหัวข้อ `media.image.stored.v1` (ถ้ายังไม่มีใน Cloud ให้พิจารณาเพิ่ม) โดย payload ใช้ `{tenantId, houseId, scope, camId, mediaId, bucket, objectKey, sha256, ts}`

ข้อควรระวัง
- ควรบันทึก schema version ใน payload ของ Kafka (`schema`, `version`) ให้ตรงกับ Cloud
- Partition key แนะนำ: `tenantId` หรือ `{tenantId,deviceId}` สำหรับ readings เพื่อกระจายโหลดสม่ำเสมอ
- Retention: ทำตามแนวทางใน Cloud (sensor data 30–90 วัน, compact สำหรับ master data)

ตัวอย่างทรานส์ฟอร์ม (pseudo)
```ts
// mqtt -> kafka (sensor clean -> sensors.*.readings.v1)
onMqtt('edge/tele/{tenant}/{house}/lab/{station}/env/{sensor}/{metric}', (m) => {
  kafka.produce('sensors.lab.readings.v1', {
    eventType: 'sensor.reading.created',
    version: '1.0',
    timestamp: m.ts,
    data: {
      tenantId: m.tenant, houseId: m.house, stationId: m.station,
      sensorId: m.sensor, metric: m.metric, value: m.value, unit: m.unit,
      quality: m.quality, metadata: m.payload ?? {}
    }
  }, { key: m.tenant });
});
```

---

## แนวทางปรับโค้ดอย่างเป็นขั้นตอน
หมายเหตุ: มีบริการตัวอย่างสำหรับช่วง migration แล้ว ดู `edge/services/edge-topic-bridge` และคู่มือ `docs/edge/topic-bridge.md`.
1) สร้างยูทิล `topicBuilder` ใช้ร่วมกันทุก service
```ts
// shared/topic.ts
export const prefix = process.env.TOPIC_PREFIX ?? 'edge';
export function teleLab(p:{tenant:string;house:string;station:string;sensor:string;metric:string}){
  return `${prefix}/tele/${p.tenant}/${p.house}/lab/${p.station}/env/${p.sensor}/${p.metric}`;
}
export function evtImageStored(p:{tenant:string;house:string;scope:string;cam:string}){
  return `${prefix}/evt/${p.tenant}/${p.house}/${p.scope}/camera/${p.cam}/stored`;
}
// ...ฟังก์ชันอื่น ๆ สำหรับ cmd/stat/cfg
```

2) images-ingestion-service
- ปัจจุบันใช้ `ROUTING_KEY=image.created` → เปลี่ยนให้เรียก `topicBuilder.evtImageStored(...)` หรือให้ “Edge Topic Bridge” แปลหัวข้อ

3) weight-associator-service
- Subscribe จากอีเวนต์ภาพ แล้ว publish `weigh.finalized` ตาม `docs/cloud/mqtt-topics.md`
- เพิ่ม `session_id` (หากมี) และ `match_window_ms`

4) sensor-service
- output `sensor.clean/anomaly` → เรียก `topicBuilder` เพื่อออก `edge/tele/...` หรือแปลผ่าน Bridge
- สำหรับ device health/LWT → ออก `edge/stat/...` แบบ retained

5) edge-orchestrator-service
- คงหัวข้อ `edge/evt/...` (datasets/model deploy) แต่เพิ่มมิติ `{tenant}/{house}` ให้ครบถ้วน

6) Mosquitto ACL
- เพิ่มสิทธิ์ read/write สำหรับ namespace `edge/` พร้อมจำกัดสิทธิ์เดิม (`sensor.*`, `dm/*`) ระหว่างช่วง migration

---

## ตัวอย่าง Bridge แบบบางเบา (Node.js)
```ts
// bridge.ts (ตัวอย่าง)
import { connect } from 'mqtt';
const cli = connect(process.env.MQTT_URL!);
cli.on('connect', () => cli.subscribe(['sensor.clean/#','sensor.anomaly/#','image/created','weight/associated'],{qos:1}));
cli.on('message', (topic, buf) => {
  try {
    const p = JSON.parse(buf.toString());
    if (topic.startsWith('sensor.clean/')) {
      const [_, tenant, metric, device] = topic.split('/');
      // เติม context: house/station/run จาก p หรือ DB
      const t = `edge/tele/${tenant}/${p.house}/${p.scope}/${p.scope_id}/${p.sensor_id || device}/${metric}`;
      cli.publish(t, JSON.stringify(p), { qos:1 });
    } else if (topic === 'image/created') {
      const t = `edge/evt/${p.tenant_id}/${p.house}/${p.scope}/camera/${p.sensor_id}/stored`;
      cli.publish(t, JSON.stringify(p), { qos:1 });
    } else if (topic === 'weight/associated') {
      const t = `edge/evt/${p.tenant}/${p.house}/${p.scope}/weigh/finalized`;
      cli.publish(t, JSON.stringify(p), { qos:1 });
    }
  } catch (e) { console.error('bridge error', e); }
});
```

---

## เช็กลิสต์ความสอดคล้อง (ทำทีละบริการ)
- sensor-service: มี topic builder และกรอก `{house}/{station|robot}/{run_id}` ครบ → publish `edge/tele/...`
- images-ingestion-service: เปลี่ยนไปใช้หัวข้อ `edge/evt/.../stored` หรือผ่าน Bridge → เพิ่ม `session_id`
- weight-associator-service: เปลี่ยนหัวข้อเป็น `edge/evt/.../weigh/finalized`
- edge-orchestrator-service: เพิ่ม `{tenant}/{house}` ให้กับ `edge/datasets/ready`, `edge/model/deploy.done`
- mosquitto: ปรับ ACL ให้รองรับ namespace `edge/` และวางแผน deprecate `sensor.*`, `dm/*`, `image/created`, `weight/associated`

---

## หมายเหตุด้าน QoS/Retain/Schema
- QoS: ใช้ QoS 1 สำหรับทุกหัวข้อ data/evt/cmd; LWT และ cfg ให้ retain=true
- Timestamp: รูปแบบ ISO-8601 (UTC) เช่น `2025-08-14T10:30:00Z`
- Payload: ใส่ฟิลด์ `schema` เพื่อระบุเวอร์ชัน เช่น `"weigh_finalized@1"`
- ข้อมูลรูปภาพอย่าส่งแบบ binary ผ่าน MQTT ให้ส่ง metadata แล้วไฟล์จริงเก็บบน MinIO/HTTP ตามที่ทำอยู่แล้ว

---

## สรุป
- โค้ด Edge ปัจจุบันทำงานครบในเชิงฟังก์ชัน แต่ naming ของหัวข้อ MQTT ยังต่างจากสเปกคลาวด์
- เอกสารนี้เสนอ mapping และแผนปรับโค้ด/เพิ่ม Bridge เพื่อให้ Ecosystem เดียวกันสามารถทำงานร่วมกับชั้น Cloud/ML ได้อย่างเป็นระบบ โดยไม่กระทบงานภาคสนามที่กำลังรันอยู่

---

## Compose (Infra/Apps) ที่มีให้ใช้งาน
- ไฟล์: `edge/docker-compose.infra.yml`, `edge/docker-compose.apps.yml` (รวม MQTT, TimescaleDB, MinIO และบริการหลัก)
- ตัวอย่างคำสั่ง
  - Start เฉพาะ infra: `docker compose -f edge/docker-compose.infra.yml up -d edge-mqtt timescaledb minio`
  - Start แอปทั้งหมด: `docker compose -f edge/docker-compose.apps.yml up -d`
  - Logs บริการ: `docker compose -f edge/docker-compose.apps.yml logs -f sensor-service`
- ข้อสำคัญใน ENV (`edge/.env`):
  - DB: `DB_HOST/PORT/NAME/USER/PASSWORD`, `DATABASE_URL`
  - MQTT: `MQTT_BROKER_URL`, per service user/pass (เช่น `MQTT_SENSOR_USER/PASSWORD`)
  - MinIO: `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `MINIO_BUCKET_*`
  - Ports: `SENSOR_PORT`, `SYNC_PORT`, `WEIGHT_ASSOCIATOR_PORT`, `IMAGE_INGESTION_SERVICE_PORT`
  - Bridge/Kafka: `MQTT_BRIDGE_USER/PASSWORD`, `TOPIC_PREFIX`, `DEFAULT_TENANT`, `DEFAULT_HOUSE`, `ENABLE_KAFKA`, `KAFKA_BROKERS`
  - ดูตัวอย่างไฟล์: `edge/.env.example`
