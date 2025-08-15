# MQTT Topics — FarmIQ Edge

เอกสารมาตรฐานการตั้งชื่อ **MQTT topics**, โครงสร้าง payload, นโยบาย QoS/retain, และตัวอย่าง ACL สำหรับระบบ IoT → Edge → AI ของโครงการ FarmIQ

> TL;DR — ใช้ prefix เดียว `edge/` แยกกลุ่มเป็น `tele|evt|cmd|stat|cfg|dlq` และแยกกรณี **Lab** กับ **Robot/Run** ให้ชัดเจน

---

## 0) ข้อกำหนดร่วม

* **Prefix**: `edge/`
* **กลุ่มท็อปปิก**

  * `tele` เทเลเมทรี (ค่าที่ไหลต่อเนื่อง เช่น weight, env, pose)
  * `evt` อีเวนต์ (เหตุการณ์ เช่น image stored, weigh finalized)
  * `cmd` คำสั่งควบคุมอุปกรณ์/บริการ
  * `stat` สถานะ/Heartbeat/LWT (Last Will)
  * `cfg` การกำหนดค่า (Retained)
  * `dlq` Dead‑letter ของบริการ
* **ตัวแปรที่ใช้ใน path**

  * `{tenant}` ผู้เช่า/ลูกค้า, `{house}` โรงเรือน/อาคาร
  * `lab/{station}` สำหรับ Lab (ไม่มี run/robot)
  * `robot/{robot_id}/run/{run_id}` สำหรับ Commercial
  * `{sensor_id}`, `{metric}`, `{cam_id}` ระบุเซ็นเซอร์/เมตริก/กล้อง
* **QoS**: ค่าเริ่มต้น **QoS 1** สำหรับข้อความปฏิบัติการทั้งหมด
* **Retain**: ใช้เฉพาะ `cfg` และ LWT ใน `stat` (ค่าอื่น **ไม่ retain**)
* **เวลามาตรฐาน**: `ts` ใช้ ISO‑8601 (UTC), เช่น `2025-08-14T10:30:00Z`
* **สคีมาของ payload**: ใส่ฟิลด์ `schema` ระบุเวอร์ชัน เช่น `"image_stored@1"`
* **กุญแจการจับคู่**: `session_id` เป็นหลัก เวลาเป็น fallback
* **รูปภาพ**: **อย่าส่ง binary ผ่าน MQTT** — กล้องอัปโหลดภาพผ่าน **HTTP → image-ingestion-service → MinIO** แล้วค่อยประกาศสถานะทาง MQTT

---

## 1) Telemetry Topics (publish โดยอุปกรณ์/บริดจ์)

### 1.1 Lab Sensors

```
edge/tele/{tenant}/{house}/lab/{station}/scale/{scale_id}/weight
edge/tele/{tenant}/{house}/lab/{station}/env/{sensor_id}/{metric}
```

**ตัวอย่าง**

```json
{
  "schema":"scale_weight@1",
  "tenant":"t1","house":"h01","station":"st01","device":"scale01",
  "ts":"2025-08-14T10:30:01Z",
  "value":87.5,
  "unit":"kg",
  "stable":true,
  "session_id":"b3f9-..."
}
```

### 1.2 Robot / Run‑based

```
edge/tele/{tenant}/{house}/robot/{robot_id}/run/{run_id}/{sensor_id}/{metric}
edge/tele/{tenant}/{house}/robot/{robot_id}/pose
```

**ตัวอย่าง pose**

```json
{"schema":"pose@1","ts":"2025-08-14T10:30:01Z","x":1.23,"y":4.56,"heading":90.0,"speed_mps":0.35}
```

### 1.3 Device Status / LWT (retained)

```
edge/stat/{tenant}/{house}/{device_type}/{device_id}
```

**ตัวอย่าง**

```json
{"schema":"device_status@1","ts":"2025-08-14T10:30:01Z","online":true,"rssi":-58,"uptime_s":12345,"meta":{"fw":"1.2.3"}}
```

> ตั้ง LWT ให้ publish `online:false` แบบ retained เมื่อออฟไลน์

---

## 2) Event Topics (publish โดย services บน Edge)

### 2.1 ภาพถ่ายแล้ว (metadata จาก Pi — optional)

```
edge/evt/{tenant}/{house}/lab/{station}/camera/{cam_id}/captured
edge/evt/{tenant}/{house}/robot/{robot_id}/camera/{cam_id}/captured
```

```json
{"schema":"image_captured@1","tenant":"t1","house":"h01","station":"st01","device":"cam01","ts":"2025-08-14T10:30:00Z","filename":"cam01_20250814T103000.jpg","session_id":"b3f9-..."}
```

### 2.2 ภาพถูกเก็บสำเร็จ (publish โดย image-ingestion-service)

```
edge/evt/{tenant}/{house}/lab/{station}/camera/{cam_id}/stored
edge/evt/{tenant}/{house}/robot/{robot_id}/camera/{cam_id}/stored
```

```json
{
  "schema":"image_stored@1",
  "tenant":"t1","house":"h01","station":"st01","device":"cam01",
  "ts":"2025-08-14T10:30:00Z",
  "media_id":123456,
  "bucket":"edge-media",
  "object_key":"tenant=t1/house=h01/station=st01/cam=cam01/date=2025/08/14/uuid.jpg",
  "sha256":"...",
  "session_id":"b3f9-..."
}
```

### 2.3 จับคู่ภาพ–น้ำหนักสำเร็จ (publish โดย weigh-associator-service)

```
edge/evt/{tenant}/{house}/lab/{station}/weigh/finalized
edge/evt/{tenant}/{house}/robot/{robot_id}/run/{run_id}/weigh/finalized
```

```json
{
  "schema":"weigh_finalized@1",
  "tenant":"t1","house":"h01","station":"st01",
  "session_id":"b3f9-...",
  "media_id":123456,
  "weight_kg":87.5,
  "t_weight":"2025-08-14T10:30:01Z",
  "strategy":"session_id",
  "match_window_ms":0
}
```

### 2.4 แจ้งเตือน/คุณภาพข้อมูล (publish โดย data-guard-service)

```
edge/evt/{tenant}/{house}/alert/{alert_type}
```

```json
{"schema":"alert@1","ts":"2025-08-14T10:30:05Z","alert_type":"weight_outlier","level":2,"context":{"value":999}}
```

---

## 3) Command Topics (publish โดย orchestrator/associator)

### 3.1 คำสั่งกล้อง (Pi subscribe)

```
edge/cmd/{tenant}/{house}/lab/{station}/camera/{cam_id}/start_capture
edge/cmd/{tenant}/{house}/lab/{station}/camera/{cam_id}/stop_capture
```

```json
{"schema":"cmd_start_capture@1","session_id":"b3f9-...","duration_ms":2500,"fps":15}
```

> เมื่อสั่งถ่ายโดย associator ให้เป็นคน **แจก `session_id`** แล้วส่งให้กล้องใช้ในทุกเฟรม

### 3.2 คำสั่งหุ่นยนต์/รัน

```
edge/cmd/{tenant}/{house}/robot/{robot_id}/run/start
edge/cmd/{tenant}/{house}/robot/{robot_id}/run/abort
edge/cmd/{tenant}/{house}/robot/{robot_id}/goto/{zone_id}
```

```json
{"schema":"run_start@1","plan":{"zones":["A1","A2"]},"cadence_sec":60}
```

---

## 4) Config Topics (Retained)

```
edge/cfg/{tenant}/{house}/lab/{station}/camera/{cam_id}
edge/cfg/{tenant}/{house}/robot/{robot_id}/{component}
```

```json
{"schema":"camera_cfg@1","fps":15,"resolution":"1280x720","exposure":"auto","white_balance":"daylight"}
```

> ใช้ QoS 1 + **retain = true** เพื่อให้ device ที่เพิ่งออนไลน์ได้ค่าทันที

---

## 5) Dead‑letter Topics (DLQ)

```
edge/dlq/{service_name}
```

**ตัวอย่าง payload**

```json
{"schema":"ingest_failed@1","reason":"minio_upload_error","context":{"filename":"cam01_...jpg"}}
```

> ทุกบริการที่ consume MQTT ควรส่งข้อความที่ parse ไม่ได้/ผิด schema/ซ้ำซ้อนมา DLQ เพื่อให้ระบบตามแก้ได้

---

## 6) ตารางบริการ: ใคร Sub/Pub อะไรบ้าง

| Service                         | Subscribe                                                      | Publish                                                                                     |
| ------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **vision-capture-service (Pi)** | `edge/cmd/.../camera/{cam_id}/#`                               | `edge/evt/.../camera/{cam_id}/captured` *(metadata)* — **ภาพอัปโหลดผ่าน HTTP ไป ingestion** |
| **image-ingestion-service**     | –                                                              | `edge/evt/.../camera/{cam_id}/stored`, `edge/dlq/image-ingestion-service`                   |
| **sensor-service**              | `edge/tele/.../scale/+/weight`, `edge/tele/.../env/+/+`        | – *(เขียน DB)*                                                                              |
| **weigh-associator-service**    | `edge/evt/.../camera/+/stored`, `edge/tele/.../scale/+/weight` | `edge/evt/.../weigh/finalized`, `edge/cmd/.../camera/{cam_id}/start_capture`                |
| **pose-tracker-service**        | `edge/tele/.../robot/*/pose`                                   | –                                                                                           |
| **device-health-service**       | `edge/stat/#`                                                  | – *(ประมวลผล/อัปเดต DB)*                                                                    |
| **data-guard-service**          | `edge/tele/#`                                                  | `edge/evt/.../alert/{type}`                                                                 |
| **robot-orchestrator**          | –                                                              | `edge/cmd/.../robot/*/run/*`, `edge/cmd/.../camera/*/start_capture`                         |
| **config-cache-service**        | –                                                              | `edge/cfg/#` *(retained)*                                                                   |

> หมายเหตุ: สำหรับ Commercial เติม path ส่วน `robot/{robot_id}/run/{run_id}` ตามโจทย์

---

## 7) ACL ตัวอย่าง (Mosquitto)

### 7.1 กล้อง `cam01` ที่สถานี `st01`

```
user cam01
pattern write edge/evt/%/%/lab/st01/camera/cam01/captured
pattern read  edge/cmd/%/%/lab/st01/camera/cam01/#
```

### 7.2 เครื่องชั่ง `scale01`

```
user scale01
pattern write edge/tele/%/%/lab/st01/scale/scale01/weight
```

### 7.3 image-ingestion-service

```
user image-ingestion
pattern write edge/evt/%/%/lab/+/camera/+/stored
pattern write edge/dlq/image-ingestion-service
```

### 7.4 weigh-associator-service

```
user weigh-associator
pattern read  edge/evt/%/%/lab/+/camera/+/stored
pattern read  edge/tele/%/%/lab/+/scale/+/weight
pattern write edge/evt/%/%/lab/+/weigh/finalized
pattern write edge/cmd/%/%/lab/+/camera/+/start_capture
```

> ปรับ `%` → `{tenant}/{house}` หากล็อกไว้รายลูกค้าเพื่อความปลอดภัยสูงสุด

---

## 8) ข้อแนะนำด้าน Broker/Client

* เปิด **NTP** ทั้ง Pi และ Edge เพื่อลด clock skew
* ตั้ง `max_payload_size` ใน Broker ป้องกันการส่ง binary image เข้ามาทาง MQTT โดยไม่ตั้งใจ
* ใช้ **QoS 1** และจับ duplicate ด้วย idempotency บน consumer
* ใช้ **persistent session** สำหรับบริการหลัก และตั้ง **LWT** ให้ทุก client

---

## 9) โครง object\_key ใน MinIO (แนะนำ)

```
tenant={tenant}/house={house}/station={station}/cam={cam_id}/date=YYYY/MM/DD/{uuid}.jpg
```

> ช่วยให้ค้น/ลบตามช่วงเวลาได้เร็ว และ map กลับหา context ได้ง่าย

---

## 10) Testing Quick‑Refs

**Subscribe น้ำหนัก (Lab)**

```
mosquitto_sub -t 'edge/tele/t1/h01/lab/+/scale/+/weight' -q 1 -v
```

**Subscribe ภาพ stored**

```
mosquitto_sub -t 'edge/evt/t1/h01/lab/+/camera/+/stored' -q 1 -v
```

**สั่งถ่ายภาพ**

```
mosquitto_pub -t 'edge/cmd/t1/h01/lab/st01/camera/cam01/start_capture' -q 1 -m '{"schema":"cmd_start_capture@1","session_id":"demo-123","duration_ms":1500,"fps":10}'
```

---

## 11) เวอร์ชันเอกสาร

* v1.0 — ตั้งต้นหัวข้อทั้งหมด, เพิ่มตัวอย่าง payload/ACL, แนะนำ QoS/retain
