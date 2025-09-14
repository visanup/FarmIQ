# FarmIQ Edge — คู่มือใช้งานรวบรัด

เอกสารสรุปวิธีติดตั้งและใช้งานชั้น Edge แบบแยกโครงสร้างพื้นฐาน (Infra) และแอป (Apps) ปัจจุบันบริการ Edge ใช้ Fastify + Prisma, พอร์ตเริ่มที่ 6300 และไม่ใช้ Kafka ที่ฝั่ง Edge แล้ว (ใช้เฉพาะ MQTT) พร้อมลิงก์ไปยังสเปกหัวข้อ MQTT และ mapping

---

## โครงสร้าง
- Compose (แยกไฟล์):
  - `edge/docker-compose.infra.yml` — MQTT, TimescaleDB, MinIO, network/volumes
  - `edge/docker-compose.apps.yml` — sensor-service, images-ingestion, weight-associator, edge-orchestrator, sync-service, edge-topic-bridge
- เอกสารสเปก:
  - `docs/edge/edge-layer.md` — สรุปหัวข้อ MQTT ฝั่ง Edge + Mapping ไป Cloud (Kafka โยกไปฝั่ง Cloud เท่านั้น)
  - `docs/edge/topic-bridge.md` — อธิบาย Edge Topic Bridge

---

## Quick Start
1) เตรียม ENV
- คัดลอกไฟล์ตัวอย่าง: `edge/.env.example` → แก้ไขเป็น `edge/.env`
- ตั้งค่าบัญชีผู้ใช้ใน Mosquitto: รัน `edge/mosquitto/config/init-users.sh`

2) เปิดโครงสร้างพื้นฐาน
- `docker compose -f edge/docker-compose.infra.yml up -d`

3) เปิดแอปบริการ
- `docker compose -f edge/docker-compose.apps.yml up -d`

4) ตรวจสุขภาพ
- MQTT: ลอง subscribe สักหัวข้อ (`$SYS/#`) หรือใช้ `mqtt-explorer` (โปรไฟล์ dev)
- MinIO: http://localhost:9001
- TimescaleDB: localhost:15432
- Bridge (edge-topic-bridge): `curl http://localhost:6305/health`

---

## บริการ (พอร์ตเริ่ม 6300; ลิงก์ไป README เฉพาะทาง)
- images-ingestion: `edge/services/images-ingestion-service/README.md`
- weight-associator: `edge/services/weight-associator-service/README.md`
- sensor-service: `edge/services/sensor-service/README.md`
- sync-service: `edge/services/sync-service/README.md`
- edge-orchestrator: `edge/services/edge-orchestrator-service/README.md`
- edge-topic-bridge: `edge/services/edge-topic-bridge/README.md`

---

## สเปกหัวข้อ MQTT และ Mapping
- สรุปสเปกและตัวอย่าง payload: `docs/edge/edge-layer.md`
- แนวทางแปลหัวข้อภายใน (`sensor.*`, `image.created`, `weight.associated`, `dm/*`) ไปเป็น `edge/{tele|evt|stat}`: `docs/edge/topic-bridge.md` (Edge ไม่ต่อ Kafka)
- เอกสารคลาวด์ที่เกี่ยวข้อง:
  - `docs/cloud/mqtt-topics.md`
  - `docs/cloud/Kafka-Complete-Guide.md`

---

## คำสั่งที่ใช้บ่อย
- Start infra: `docker compose -f edge/docker-compose.infra.yml up -d`
- Start apps: `docker compose -f edge/docker-compose.apps.yml up -d`
- ดู log บริการ: `docker compose -f edge/docker-compose.apps.yml logs -f sensor-service`
- Restart เฉพาะ bridge: `docker compose -f edge/docker-compose.apps.yml restart edge-topic-bridge`

---

## หมายเหตุ/แนะนำ
- ระหว่าง migration ให้ใช้ Edge Topic Bridge เพื่อแปลงหัวข้อเดิมให้ตรงสเปก Cloud โดยไม่ต้องแก้โค้ดบริการเดิม
- เมื่อพร้อม ค่อยปรับบริการแต่ละตัวให้ publish `edge/*` โดยตรง จากนั้นสามารถนำ Bridge ออกได้
- ตรวจสอบ QoS/retain ตามชนิดหัวข้อ: ควรใช้ QoS 1; retain เฉพาะ `cfg` และ `stat` (LWT/Status)

