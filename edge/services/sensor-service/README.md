# sensor-service

บริการ **รับข้อมูลเซ็นเซอร์** จาก MQTT (`sensor.raw/...`) แล้ว **ตรวจสอบ / แปลง / enrich** และ **เผยแพร่ต่อ** ไปที่หัวข้อทำความสะอาด (`sensor.clean/...`) หรือแจ้งเตือนความผิดปกติ (`sensor.anomaly/...`) พร้อมตัวเลือกเขียนลงฐานข้อมูล (TimescaleDB/PostgreSQL)

> ตัวอย่าง log เมื่อเชื่อมต่อสำเร็จ
> `📡 MQTT connected: mqtt://edge-mqtt:1883`
> `☕ Subscribed: sensor.raw/+/+/+`

---

## คุณสมบัติ

* Subscribe: `sensor.raw/+/+/+` (ค่าเริ่มต้น ปรับได้ผ่าน `.env`)
* Publish:

  * ข้อมูลผ่านเกณฑ์ → `sensor.clean/...`
  * ผิดสคีมาหรือค่าผิดปกติ → `sensor.anomaly/...`
  * (ตัวเลือก) Dead-letter → `sensor.dlq/...`
* แยก **namespace** ได้ด้วยตัวแปร: `PUB_NS_CLEAN`, `PUB_NS_ANOMALY`, `PUB_NS_DLQ`
* รองรับ **multi-tenant** / device id model (สอดคล้อง ACL แบบ `pattern`)
* เขียน DB ได้ (TimescaleDB/PostgreSQL) เมื่อเปิด `WRITE_DB=true`
* HTTP server (สำหรับ health/metrics ของบริการ) ที่พอร์ต `SENSOR_PORT` (ค่าเริ่ม 6309)
* `.env` loader แบบ **ฉลาด**: หาไฟล์ `.env` อัตโนมัติ หรือรับจาก `docker-compose`

---

## สถาปัตยกรรมย่อ

```
(sensor devices) ---> sensor.raw/{tenant}/{type}/{deviceId} ---> [sensor-service]
                                                         |--> validate/transform/enrich
                                                         |--> sensor.clean/{tenant}/{type}/{deviceId}
                                                         |--> sensor.anomaly/{tenant}/{type}/{deviceId}
                                                         |--> (optional) DB write (Timescale)
```

---

## MQTT Topics

ค่าเริ่มต้น (แก้ได้ใน `.env`):

* Subscribe (input):

  * `SENSOR_RAW_SUB=sensor.raw/+/+/+`
* Publish (output namespaces):

  * `PUB_NS_CLEAN=sensor.clean`
  * `PUB_NS_ANOMALY=sensor.anomaly`
  * `PUB_NS_DLQ=sensor.dlq`

> ตัวอย่าง mapping:
> รับหัวข้อ: `sensor.raw/t1/thermo/dev-001`
> ส่งต่อ: `sensor.clean/t1/thermo/dev-001` (หรือ `sensor.anomaly/t1/thermo/dev-001`)

---

## ตัวอย่าง Payload

### Raw (เข้า)

```json
{
  "ts": "2025-08-16T07:00:00Z",
  "value": 23.5,
  "unit": "C",
  "meta": { "firmware": "1.2.3" }
}
```

### Clean (ออก)

```json
{
  "schema": "sensor_clean@1",
  "ts": "2025-08-16T07:00:00Z",
  "tenant": "t1",
  "type": "thermo",
  "device_id": "dev-001",
  "value": 23.5,
  "unit": "C",
  "meta": { "firmware": "1.2.3" }
}
```

### Anomaly (ออก)

```json
{
  "schema": "sensor_anomaly@1",
  "ts": "2025-08-16T07:00:00Z",
  "tenant": "t1",
  "type": "thermo",
  "device_id": "dev-001",
  "reason": "missing_field:value",
  "raw": { "ts": "2025-08-16T07:00:00Z", "unit":"C" }
}
```

> หมายเหตุ: สคีมาที่แท้จริงขึ้นกับโค้ดแปลง/ตรวจสอบของคุณ ถ้ายังไม่มีสคีมาอย่างเป็นทางการ แนะนำเก็บที่ `contracts/mqtt/` แล้วให้ทั้งระบบอ้างอิงชุดเดียวกัน

---

## การตั้งค่า (Environment Variables)

ไฟล์ `.env` (อาจใช้ร่วมกันหลาย service ได้ แต่ระวังชื่อแปรชนกัน) — **เซอร์วิสนี้**จะอ่านเฉพาะชุด `MQTT_SENSOR_*` เพื่อไม่ชนกับบริการอื่น (เช่น image ingestion)

```dotenv
## --- Database (Timescale/Postgres) ---
DB_HOST=timescaledb
DB_PORT=5432
DB_NAME=sensors_db
DB_USER=postgres
DB_PASSWORD=password
WRITE_DB=false                 # true = เขียน DB

## --- HTTP server ---
SENSOR_PORT=6309

## --- MQTT broker ---
MQTT_BROKER_URL=mqtt://edge-mqtt:1883
# วิธี A: ใส่ user/pass แยก (สำหรับ sensor-service เท่านั้น)
MQTT_SENSOR_USER=edge_sensor_svc
MQTT_SENSOR_PASSWORD=admin1234
# วิธี B: หรือจะฝังใน URL ก็ได้ (อย่าตั้ง SENSOR_* ซ้ำ)
# MQTT_BROKER_URL=mqtt://edge_sensor_svc:admin1234@edge-mqtt:1883

## --- Topics / Namespaces ---
SENSOR_RAW_SUB=sensor.raw/+/+/+
PUB_NS_CLEAN=sensor.clean
PUB_NS_ANOMALY=sensor.anomaly
PUB_NS_DLQ=sensor.dlq

## --- Misc ---
LOG_LEVEL=info
```

**สำคัญ:** ถ้าใช้ `.env` รวมหลาย service ให้ตั้งค่าผู้ใช้ MQTT **เฉพาะของบริการนี้** ด้วย `MQTT_SENSOR_USER/MQTT_SENSOR_PASSWORD` และหลีกเลี่ยง `MQTT_USER/MQTT_PASSWORD` เพื่อไม่ชนกัน

---

## การรันด้วย Docker Compose

ในโฟลเดอร์ `edge/`:

```bash
docker-compose up -d sensor-service
# ดู log
docker-compose logs -f sensor-service
```

log ที่คาดหวัง:

```
[config] no local .env file; relying on process.env
🔌 MQTT connecting to mqtt://edge-mqtt:1883 as edge_sensor_svc
🚀 sensor-service http://0.0.0.0:6309
📡 MQTT connected: mqtt://edge-mqtt:1883
☕ Subscribed: sensor.raw/+/+/+
```

> ถ้าเจอ `Connection refused: Not authorized (code 5)`
> ให้เช็กว่า user/pass ถูกต้องและถูกส่งเข้าไปจริง
> ทดสอบจาก host:
> `mosquitto_sub -h edge-mqtt -p 1883 -u edge_sensor_svc -P 'admin1234' -t '$SYS/#' -C 1 -v`
> ถ้าไม่ผ่าน ให้รีเซ็ตรหัสผ่านใน broker:
> `mosquitto_passwd -b /mosquitto/config/passwordfile edge_sensor_svc admin1234 && docker restart edge-mqtt`

---

## Health & Debug

* (ทั่วไป) `GET http://<edge-ip>:6309/health` → สถานะบริการ (ถ้ามี route นี้ในโค้ด)
* MQTT live test:

  ```bash
  # ยิง raw
  mosquitto_pub -h edge-mqtt -p 1883 -u edge_sensor_svc -P 'admin1234' \
    -t 'sensor.raw/t1/thermo/dev-001' \
    -m '{"ts":"2025-08-16T07:00:00Z","value":23.5,"unit":"C"}'

  # เปิดดู clean/anomaly
  mosquitto_sub -h edge-mqtt -p 1883 -u edge_sensor_svc -P 'admin1234' -t 'sensor.clean/#' -v
  mosquitto_sub -h edge-mqtt -p 1883 -u edge_sensor_svc -P 'admin1234' -t 'sensor.anomaly/#' -v
  ```

---

## การกำหนดสิทธิ์ (Mosquitto ACL)

ตัวอย่าง ACL ที่เหมาะกับบทบาท `edge_sensor_svc`:

```
user edge_sensor_svc
topic read  sensor.raw/#
topic write sensor.clean/#
topic write sensor.anomaly/#
topic write sensor.dlq/#
topic read  cmd/#
```

และสำหรับอุปกรณ์จริง (username = tenant, clientId = deviceId) สามารถใช้ `pattern` ตามโมเดล multi-tenant ที่มีอยู่แล้วของคุณ

---

## การเขียนฐานข้อมูล

เปิดด้วย `WRITE_DB=true` และตั้งค่า DB ให้ถูกต้อง:

```
DB_HOST=timescaledb
DB_PORT=5432
DB_NAME=sensors_db
DB_USER=postgres
DB_PASSWORD=password
```

> แนะนำให้ใช้ Timescale hypertable และสร้างดัชนี (time, device\_id/type) เพื่อ query เร็ว
> ถ้ายังไม่ต้องการเขียน DB ให้ตั้ง `WRITE_DB=false` (ค่าเริ่ม)

---

## การดีพลอย/ดูแล

* **เวลาระบบ** (Edge/Devices) ต้องตรง NTP เพื่อให้ `ts` และการ associate ข้อมูลถูกต้อง
* **Retention**: ตั้งนโยบายเก็บข้อมูล (DB/Topic) ตาม SLA
* **Observability**: เก็บ log 4xx/5xx ของ DB/HTTP, และ capture payload anomaly เพื่อวิเคราะห์
* **Security**:

  * แยก user ต่อ service (อย่างที่ทำอยู่: `edge_sensor_svc`, `edge_image_ingest`, …)
  * ใช้ ACL แบบ least-privilege
  * ถ้าข้ามไซต์/อินเทอร์เน็ต ให้ใช้ `mqtts://` + CA หรือวิธี overlay (WireGuard/Tailscale)

---

## FAQ

**Q: ใช้ `.env` เดียวร่วมกันหลาย service ได้ไหม?**
A: ได้ แต่ให้ใช้ชื่อตัวแปร **เฉพาะ** ของแต่ละ service เพื่อลดการชนกัน เช่น service นี้ใช้ `MQTT_SENSOR_USER/PASSWORD` ไม่ใช่ `MQTT_USER/PASSWORD`

**Q: ต่อ MQTT แล้วขึ้น code 5?**
A: ส่วนใหญ่เป็น user/pass ไม่ตรงหรือไม่ได้ส่ง ตรวจ env ในคอนเทนเนอร์, ทดสอบด้วย `mosquitto_sub`, ถ้าไม่ได้ให้ `mosquitto_passwd` รีเซ็ตและ restart broker

**Q: จะให้บริการนี้เขียน DB ไหม?**
A: เปิด `WRITE_DB=true` และตั้งค่าการเชื่อมต่อ DB ให้ครบ ตรวจ schema/migration ให้พร้อม

## ทดสอบส่งข้อมูลโดยใช้ edge_sensor_svc user ที่มี permission แล้ว:
`docker run --rm --network farmiq-edge_farm_edge eclipse-mosquitto:2.0 mosquitto_pub -h edge-mqtt -p 1883 -u edge_sensor_svc -P admin1234 -i test_publisher -q 1 -t "sensor.raw/farm-001/TEMP/r001" -m '{\"ts\":\"2025-09-02T12:30:00Z\",\"value\":32.0,\"unit\":\"C\",\"sensor_id\":\"TEMP_SENSOR_001\",\"meta\":{\"device_id\":\"1\"}}'`

`docker run --rm --network farmiq-edge_farm_edge eclipse-mosquitto:2.0 mosquitto_pub -h edge-mqtt -p 1883 -u edge_sensor_svc -P admin1234 -i test_publisher -q 1 -t "sensor.raw/farm-001/HUM/r001" -m '{\"ts\":\"2025-09-02T12:31:00Z\",\"value\":70.0,\"unit\":\"%\",\"sensor_id\":\"HUMID_SENSOR_002\",\"meta\":{\"device_id\":\"sensor01\"}}'`

## เช็คว่าข้อมูลเข้า database หรือไม่:
docker run --rm --network farmiq-edge_farm_edge eclipse-mosquitto:2.0 mosquitto_pub -h edge-mqtt -p 1883 -u edge_sensor_svc -P admin1234 -i test_publisher -q 1 -t "sensor.raw/farm-001/CO2/r001" -m '{\"ts\":\"2025-09-02T12:32:00Z\",\"value\":445.0,\"unit\":\"ppm\",\"sensor_id\":\"CO2_SENSOR_003\",\"meta\":{\"device_id\":\"sensor01\"}}'
docker exec -it farmiq-edge-timescaledb-1 psql -U postgres -d sensors_db -c "SELECT time, tenant_id, device_id, sensor_id, metric, value, quality FROM sensors.device_readings WHERE tenant_id = 'farm-001' ORDER BY time DESC LIMIT 5;"
