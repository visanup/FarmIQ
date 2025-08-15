# vision-capture-service

บริการถ่ายภาพจากอุปกรณ์ปลายทาง (device) เพื่อส่งเข้า **image-ingestion-service** โดยรองรับทั้งโหมด **Lab scale** และ **Commercial scale**:

* **Lab scale**: ถ่ายเมื่อ “มีวัตถุ” (motion presence) และ/หรือ “น้ำหนักนิ่งบนเครื่องชั่ง” (scale stable) ตามเงื่อนไขที่กำหนด
* **Commercial scale**: ถ่ายตาม **คำสั่งจากหุ่นยนต์** ผ่าน MQTT (รองรับ metadata เช่น event\_id / job\_id / waypoint)

ภาพถูกเก็บชั่วคราวบนเครื่อง (spool) แล้วอัปโหลดไปฝั่ง ingestion แบบ **retry ได้** พร้อมส่ง metadata และ event ผ่าน MQTT เพื่อผูกโยงรูป-น้ำหนัก-เหตุการณ์ได้ครบวงจร

---

## คุณสมบัติหลัก

* รองรับกล้อง:

  * OpenCV (USB index: `0,1,...`), RTSP/HTTP URL
  * Intel RealSense D4xx / D457 (color → fallback infrared)
* Trigger หลายแบบ:

  * Interval / Cron (Lab)
  * Motion presence (background subtraction + area threshold)
  * Weight stable จากเครื่องชั่งผ่าน serial (pyserial)
  * MQTT command จากหุ่นยนต์ (`cmd_start_capture@2`)
* คุณภาพภาพ: **burst capture** + เลือกภาพ **คมสุด** (Laplacian variance)
* ความปลอดภัย: API Key แบบง่าย **หรือ** API Key + **HMAC request signing**
* อัปโหลดแบบทนทาน: **spool + retry** (ไฟล์ `.json` sidecar)
* Event:

  * ภาพ: `image_captured@2` → MQTT + อัปโหลด ingestion
  * น้ำหนัก: `scale_weight@1` → MQTT
* REST API:

  * `/v1/health`
  * `/v1/capture` (คืน 204 ถ้าไม่เข้าเงื่อนไข เช่น ไม่มีวัตถุ/น้ำหนักไม่นิ่ง/คูลดาวน์)

---

## โครงสร้างโปรเจ็กต์ (ย่อ)

```
vision-capture-service/
├─ app/
│  ├─ main.py
│  ├─ config.py
│  ├─ v1/endpoint.py
│  ├─ services/
│  │  ├─ camera.py
│  │  ├─ capture_service.py
│  │  ├─ ingest_client.py
│  │  ├─ mqtt_bus.py
│  │  └─ (presence/scale รวมใน capture_service.py แล้ว)
│  └─ utils/
│     ├─ hashing.py
│     └─ time.py
├─ requirements.txt
├─ Dockerfile
├─ docker-compose.yml
└─ data/
   ├─ .env
   ├─ media/   (MEDIA_DIR)
   └─ spool/   (SPOOL_DIR)
```

---

## การติดตั้ง / รัน

### 1) เตรียม `.env` (ตัวอย่าง)

> **สำคัญ:** ตั้งค่า `MQTT_BROKER_URL` และ `INGEST_BASE_URL` ให้เป็น **IP/hostname ของ Edge server** ที่ device เข้าถึงได้จริง

```dotenv
# ========= Identity =========
TENANT=t1
HOUSE=h01
STATION=st01
CAM_ID=cam01

# ========= Camera =========
# "0" | "1" ... (USB) | "rtsp://..." | "http(s)://..." | "realsense" | "d457" | "rs:ir"
CAMERA_SOURCE=0
RESOLUTION=1280x720
FPS=10
IMG_FORMAT=jpg

# ========= Local paths =========
MEDIA_DIR=/data/media
SPOOL_DIR=/data/spool

# ========= Ingestion HTTP API =========
INGEST_BASE_URL=http://192.168.1.50:8080
INGEST_API_PATH=/api/v1/images/upload
VERIFY_TLS=false

# ========= MQTT =========
# mqtt://USER:PASS@HOST:PORT  (ถ้ากรอก MQTT_USER/PASSWORD จะ override ค่าจาก URL)
MQTT_BROKER_URL=mqtt://192.168.1.50:1883
MQTT_USER=admin
MQTT_PASSWORD=admin1234
MQTT_QOS=1
MQTT_KEEPALIVE=30

# ========= Scheduler =========
CAPTURE_MODE=mixed           # cron | interval | robot | mixed
#CRON=*/1 * * * *           # ตัวอย่าง: ทุก 1 นาที (ใช้เมื่อ CAPTURE_MODE=cron/mixed)
INTERVAL_SEC=60              # ใช้เมื่อ CAPTURE_MODE=interval/mixed

# ========= HTTP server =========
IMAGE_INGESTION_PORT=8081   # พอร์ตบน host ที่จะ map -> container:8081
# HTTP_PORT จะอ่านค่ามาจาก IMAGE_INGESTION_PORT โดยอัตโนมัติ

# ========= Security =========
API_KEY=super-secret-edge-key
API_KEY_ID=cam01
USE_REQUEST_SIGNING=true     # ถ้า true → ลงลายเซ็น HMAC
# หมายเหตุ: ไม่ใช้ Bearer token ก็เว้นว่างไว้

# ========= Presence (motion) =========
PRESENCE_MODE=motion         # none | motion
PRESENCE_MIN_AREA=1500
PRESENCE_MIN_FRAMES=3
PRESENCE_TIMEOUT_MS=5000
PRESENCE_ROI=                # "x1,y1,x2,y2" (ว่าง=ทั้งภาพ)
COOLDOWN_SEC=2

# ========= Scale (เครื่องชั่ง) =========
SCALE_ENABLED=true
SCALE_ID=sc01
SCALE_PORT=/dev/ttyUSB0
SCALE_BAUD=9600
SCALE_MIN_GRAMS=50
SCALE_STABLE_DELTA=2
SCALE_STABLE_MS=800
SCALE_TIMEOUT_MS=6000

# ========= Misc =========
LOG_LEVEL=INFO
NODE_ENV=development
```

### 2) Docker (บีบให้เล็ก รองรับ Pi)

**Dockerfile** มี arg `ENABLE_REALSENSE` (ค่าเริ่มต้น false)

* USB/RTSP: ไม่ต้องทำอะไรเพิ่ม
* RealSense: build ด้วย `--build-arg ENABLE_REALSENSE=true` และรันด้วย `--device /dev/bus/usb:/dev/bus/usb`

**docker-compose.yml** (บริการเดียว `vision-capture-service`) — ใช้เวอร์ชันที่เราจัดให้แล้ว

รัน:

```bash
# USB/UVC (เช่น /dev/video0)
docker compose up -d --build

# RealSense D457
docker compose build --build-arg ENABLE_REALSENSE=true
docker compose up -d
```

> ถ้าใช้ USB camera ให้แก้ `devices:` ใน compose เป็น `- /dev/video0:/dev/video0`
> ถ้าใช้ RTSP/HTTP URL → ลบ `devices:` ออกได้

---

## REST API

### `GET /v1/health`

```json
{ "status": "ok", "service": "vision-capture-service", "ts": "..." }
```

### `POST /v1/capture`

Body:

```json
{
  "session_id": "optional",
  "only_if_present": true,
  "wait_weight": true,
  "settle_ms": 250,
  "burst_count": 3,
  "burst_interval_ms": 120
}
```

* ถ้า **ไม่เข้าเงื่อนไข** (ไม่มีวัตถุ/น้ำหนักไม่นิ่ง/ติดคูลดาวน์) → **204 No Content**
* ถ้าได้ถ่าย → `200 OK`:

```json
{
  "session_id": "abc-123",
  "local_path": "/data/spool/xxxx.jpg",
  "sha256": "..."
}
```

---

## MQTT Topics & Payload

> ตัวแปร: `{TENANT}/{HOUSE}/lab/{STATION}/camera/{CAM_ID}`

### คำสั่งถ่าย (Robot → Camera)

**Topic**
`edge/cmd/{tenant}/{house}/lab/{station}/camera/{cam_id}/start_capture`

**Payload v2 (แนะนำ)**

```json
{
  "schema": "cmd_start_capture@2",
  "event_id": "uuid-robot-123",
  "robot_id": "rb01",
  "job_id": "job-2025-08-15-001",
  "waypoint_id": "wp-07",
  "pose": {"x": 1.23, "y": 2.34, "z": 0.55, "yaw": 90.0},
  "settle_ms": 250,
  "burst": {"count": 3, "interval_ms": 120},
  "deadline_ms": 2000,
  "only_if_present": true,
  "wait_weight": true
}
```

### ACK (Camera → …)

**Topic**
`edge/evt/.../camera/{cam_id}/ack`

**Payload**

```json
{ "schema":"capture_ack@1", "event_id":"uuid-robot-123", "accepted":true, "reason":null, "ts":"..." }
```

### ภาพถ่ายเสร็จ (Camera → …)

**Topic**
`edge/evt/{tenant}/{house}/lab/{station}/camera/{cam_id}/captured`

**Payload**

```json
{
  "schema": "image_captured@2",
  "ts": "...",
  "session_id": "abc-123",
  "tenant":"t1","house":"h01","station":"st01","cam_id":"cam01",
  "filename": "xxxx.jpg",
  "event_id":"uuid-robot-123",
  "robot_id":"rb01",
  "job_id":"job-2025-08-15-001",
  "waypoint_id":"wp-07",
  "quality": {"blur_var": 153.4, "attempt": 1},
  "weight_g": 812.5,
  "reason": "interval|cron|mqtt_cmd|rest"
}
```

### ค่าน้ำหนัก (Scale → …)

**Topic**
`edge/evt/{tenant}/{house}/lab/{station}/scale/{SCALE_ID}/weight`

**Payload**

```json
{
  "schema": "scale_weight@1",
  "ts": "...",
  "tenant":"t1","house":"h01","station":"st01",
  "session_id":"abc-123",
  "event_id":"uuid-robot-123",
  "weight_g": 812.5,
  "reason": "interval|cron|mqtt_cmd|rest"
}
```

> รูป-น้ำหนัก **เชื่อมโยงกัน** ด้วย `session_id` (และ `event_id` ถ้ามี)

---

## การอัปโหลดไป Ingestion

* เก็บไฟล์รูปใน `SPOOL_DIR` สร้าง sidecar `.json` คู่กัน เช่น `image.jpg.json`
* uploader background อ่าน sidecar → POST ไป `INGEST_BASE_URL + INGEST_API_PATH`
* **Auth**

  * โหมดง่าย: `X-API-Key: <API_KEY>`
  * โหมด HMAC:
    Headers: `X-API-Key-Id`, `X-Signature`, `X-Timestamp`, `X-Nonce`, `X-Content-SHA256`
    Signature: `HMAC_SHA256(API_KEY, f"{method}\n{path}\n{ts}\n{sha256}\n{nonce}")` → Base64
    (ฝั่ง ingestion ต้องตรวจ timestamp ±skew, ป้องกัน replay ด้วย nonce, และเทียบ SHA256 กับไฟล์)

ตัวอย่าง metadata ที่ส่งไป ingestion:

```json
{
  "tenant":"t1","house":"h01","station":"st01","cam_id":"cam01",
  "ts":"...", "session_id":"abc-123", "sha256":"...",
  "event_id":"...", "robot_id":"...", "job_id":"...", "waypoint_id":"...",
  "quality_blur_var":153.4, "attempt":1, "weight_g":812.5, "reason":"interval"
}
```

---

## การตั้งค่า Presence & Scale

* **Presence (motion)**

  * `PRESENCE_MODE=motion`
  * `PRESENCE_MIN_AREA` (พิกเซลขั้นต่ำของคอนทัวร์)
  * `PRESENCE_MIN_FRAMES` (ต้องเจอชิดกันกี่เฟรม)
  * `PRESENCE_TIMEOUT_MS` (รอสูงสุดเมื่อ `only_if_present=true`)
  * `PRESENCE_ROI="x1,y1,x2,y2"` (ถ้าอยากจำกัดพื้นที่ตรวจ)

* **Scale (serial)**

  * `SCALE_ENABLED=true`, `SCALE_PORT=/dev/ttyUSB0`, `SCALE_BAUD=9600`
  * เกณฑ์นิ่ง: `SCALE_MIN_GRAMS`, `SCALE_STABLE_DELTA`, `SCALE_STABLE_MS`
  * `SCALE_TIMEOUT_MS` (รอสูงสุดเมื่อ `wait_weight=true`)
  * ถ้ารุ่นเครื่องชั่งส่งรูปแบบข้อความต่างไป ให้ปรับ parser ในโค้ด (เมธอด `_parse_weight`)

---

## การสร้าง / พัฒนา

ติดตั้งท้องถิ่น (ถ้าต้องรันนอก Docker):

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
DOTENV_PATH=./data/.env python -m app.main
```

เรียกดูสุขภาพ:

```bash
curl http://127.0.0.1:8081/v1/health
```

ลองยิงถ่าย:

```bash
curl -X POST http://127.0.0.1:8081/v1/capture -H "Content-Type: application/json" -d '{"only_if_present":true}'
```

---

## ทดสอบ MQTT (ตัวอย่าง)

Subscribe:

```bash
mosquitto_sub -h <EDGE_IP> -p 1883 -u admin -P admin1234 -t 'edge/#' -v
```

Command (robot → camera):

```bash
mosquitto_pub -h <EDGE_IP> -p 1883 -u admin -P admin1234 \
  -t 'edge/cmd/t1/h01/lab/st01/camera/cam01/start_capture' \
  -m '{"schema":"cmd_start_capture@2","event_id":"demo-001","only_if_present":true,"wait_weight":true,"burst":{"count":3,"interval_ms":120}}'
```

---

## เคล็ดลับ Production

* **เวลา**: เปิด NTP ทั้ง Edge/Device ให้ตรง (สำคัญกับ HMAC และ trace)
* **เครือข่าย**: บน field site แนะนำ WireGuard/Tailscale หรือ TLS proxy ถ้าข้ามไซต์
* **Storage**: มี spool + retry อยู่แล้ว แต่ควรมี policy กวาดไฟล์เก่ากันล้น
* **Security**:

  * แยก **API\_KEY** ต่อ device → revoke ง่าย
  * Ingestion ตรวจ `X-Timestamp`/`X-Nonce` กัน replay + เทียบ `X-Content-SHA256`
  * Rate-limit และ allowlist IP ที่ปรากฏบน Edge
* **สังเกตการณ์**: เก็บ log 401/403 ฝั่ง ingestion และ upload error ฝั่ง device → แจ้งเตือน

---

## ปัญหาที่พบบ่อย

* **RTSP อ่านไม่ได้** → ตรวจ URL/สิทธิ์, latency ของกล้อง, เครือข่าย
* **RealSense ไม่ขึ้น** → ต้อง build ด้วย `ENABLE_REALSENSE=true` + map `/dev/bus/usb:/dev/bus/usb`
* **น้ำหนักไม่ขึ้น** → ตรวจ `SCALE_PORT`/`BAUD` และปรับ `_parse_weight` ให้ตรงรุ่น
* **ไม่ถ่ายสักที** → อาจติดคูลดาวน์ `COOLDOWN_SEC` หรือไม่ผ่านเงื่อนไข presence/weight (ลองปิดเงื่อนไขเพื่อไล่ทีละจุด)

---

## ใบอนุญาต

ภายในองค์กร / ตามที่ทีมกำหนด (เติมเองได้ตามนโยบายของคุณ)

