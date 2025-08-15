````markdown
# sensor-service

`sensor-service` เป็น microservice สำหรับรับ–เก็บ–แสดงผลข้อมูลเซนเซอร์แบบ Time Series โดยใช้ PostgreSQL + TimescaleDB

---

## 🗄️ Database Schema

```sql
CREATE SCHEMA IF NOT EXISTS sensors;
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- ตาราง sensor_data บันทึกข้อมูลเซนเซอร์ตามเวลา
CREATE TABLE IF NOT EXISTS sensors.sensor_data (
  time         TIMESTAMPTZ      NOT NULL,
  device_id    INTEGER          NOT NULL,
  topic        TEXT             NOT NULL,
  value        DOUBLE PRECISION NOT NULL,
  raw_payload  JSONB,
  PRIMARY KEY (time, device_id, topic)
);

-- แปลงเป็น Hypertable (partition ตามวัน)
SELECT create_hypertable(
  'sensors.sensor_data',
  'time',
  chunk_time_interval => INTERVAL '1 day',
  if_not_exists       => TRUE,
  migrate_data        => TRUE
);

-- ดัชนีเสริม
CREATE INDEX IF NOT EXISTS idx_sensor_data_device_time
  ON sensors.sensor_data (device_id, time DESC);

CREATE INDEX IF NOT EXISTS idx_sensor_data_topic_time
  ON sensors.sensor_data (topic, time DESC);
````

* **Hypertable**: TimescaleDB ช่วยจัดการ partition อัตโนมัติบนคอลัมน์ `time`
* **Primary Key**: `(time, device_id, topic)`
* **Indexes**: ช่วยให้ query ตามอุปกรณ์และหัวข้อรวดเร็วขึ้น

---

## 🛠️ การติดตั้ง & รัน

1. **Clone โปรเจกต์**

   ```bash
   git clone <repo-url>
   cd services/sensor-service
   ```
2. **ติดตั้ง dependencies**

   ```bash
   yarn install
   ```
3. **ตั้งค่า `.env`** (root ของ workspace):

   ```dotenv
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=secret
   DB_NAME=sensors_db
   SENSOR_SERVICE_PORT=4101
   ```
4. **รันด้วย ts-node-dev**

   ```bash
   yarn dev
   ```

---

## ✨ การทำงานหลัก

* Service นี้มี **route** เดียวสำหรับดึงข้อมูลเซนเซอร์ล่าสุด (`/api/sensors/latest`)
* ข้อมูลล่าสุดถูกเก็บชั่วคราวในหน่วยความจำ (cache) จำนวน **10 รายการล่าสุด**
* เมื่อมีข้อมูลใหม่เข้ามา (ผ่าน MQTT หรือ WebSocket) ให้เรียก `updateSensorData(newData)` เพื่ออัปเดต cache

---

## 📡 API Endpoint

### GET `/api/sensors/latest`

* **Description**: ดึง 10 ข้อมูลเซนเซอร์ล่าสุดจากหน่วยความจำ
* **Response**:

  ```json
  {
    "data": [
      {
        "time": "2025-06-27T04:00:00Z",
        "device_id": 42,
        "topic": "sensor/temperature",
        "value": 25.96,
        "raw_payload": { /* JSON payload */ }
      },
      // ...รวม 10 รายการ
    ]
  }
  ```

---

## 📈 การขยายเพิ่มเติม

* **Persist to DB**: ปรับให้อ่าน–เขียน TimescaleDB จริง แทนการใช้ memory cache
* **Query API**: เพิ่ม endpoints สำหรับ

  * ดึง historical data ตามช่วงเวลา `?device_id=&topic=&from=&to=`
  * สถิติ (avg, min, max) ต่อช่วงเวลาที่กำหนด
* **Authentication**: ป้องกันการเข้าถึงด้วย JWT
* **WebSocket / MQTT**: ให้ service subscribe topic แล้วอัปเดต cache และ DB อัตโนมัติ

---

หากต้องการตัวอย่างโค้ดหรือการเชื่อมต่อ MQTT เพิ่มเติม แจ้งได้เลยครับ!
