# Kafka Integration Test for Sensor Streamer Service

เอกสารนี้อธิบายการทดสอบการทำงานของ sensor-streamer-service กับ Kafka topics ใหม่

## 🧪 การทดสอบ

### 1. เริ่มต้นระบบ Infrastructure

```bash
# เริ่ม Kafka และสร้าง topics อัตโนมัติ
cd ../../../
docker-compose -f docker-compose.infra.yml up -d

# ตรวจสอบสถานะ
docker-compose -f docker-compose.infra.yml ps
```

### 2. ทดสอบ Kafka Integration

```bash
# วิธีที่ 1: ใช้ npm script
npm run test:kafka

# วิธีที่ 2: รันโดยตรง
node test-kafka-integration.js

# วิธีที่ 3: ใช้ environment variables
KAFKA_BROKERS=kafka:9092 npm run test:kafka
```

### 3. ทดสอบผ่าน Docker

```bash
# Build และรัน sensor-streamer service
docker-compose -f docker-compose.apps.yml up -d sensor-streamer

# ตรวจสอบ logs
docker-compose -f docker-compose.apps.yml logs -f sensor-streamer

# ทดสอบ Kafka integration
docker exec farmiq-sensor-streamer npm run test:kafka
```

## 📋 Topics ที่ทดสอบ

### 1. Sensor Readings
- **Topic**: `sensors.device.readings.v1`
- **Event Type**: `sensor.reading.created`
- **Data**: ข้อมูลเซ็นเซอร์แบบ real-time

### 2. Device Health
- **Topic**: `sensors.device.health.v1`
- **Event Type**: `device.health.updated`
- **Data**: สถานะสุขภาพอุปกรณ์

### 3. Lab Readings
- **Topic**: `sensors.lab.readings.v1`
- **Event Type**: `lab.reading.created`
- **Data**: ข้อมูลการทดสอบในห้องปฏิบัติการ

### 4. Sweep Readings
- **Topic**: `sensors.sweep.readings.v1`
- **Event Type**: `sweep.reading.created`
- **Data**: ข้อมูลการสแกน/กวาด

## 🔧 Configuration

### Environment Variables

```bash
# Kafka Configuration
KAFKA_BROKERS=kafka:9092
KAFKA_SSL=false
KAFKA_CLIENT_ID=sensor-streamer-service

# Topic Configuration
TOPIC_SENSOR_READINGS=sensors.device.readings.v1
TOPIC_DEVICE_HEALTH=sensors.device.health.v1
TOPIC_LAB_READINGS=sensors.lab.readings.v1
TOPIC_SWEEP_READINGS=sensors.sweep.readings.v1
```

### Event Schema

ทุก event จะมี schema ดังนี้:

```json
{
  "eventId": "evt_1234567890_abc123def",
  "eventType": "sensor.reading.created",
  "version": "1.0",
  "timestamp": "2024-01-15T10:30:00Z",
  "source": {
    "service": "sensor-streamer-service",
    "version": "1.0.0"
  },
  "data": {
    // ข้อมูลเฉพาะของแต่ละ event type
  }
}
```

## 📊 ผลลัพธ์ที่คาดหวัง

### 1. การ Publish
- ✅ Events ถูกส่งไปยัง topics ที่ถูกต้อง
- ✅ Event schema ถูกต้องตามมาตรฐาน
- ✅ Headers และ metadata ครบถ้วน
- ✅ Retry mechanism ทำงานได้

### 2. การ Consume
- ✅ Events ถูก consume ได้ถูกต้อง
- ✅ Event parsing ทำงานได้
- ✅ Error handling ทำงานได้

### 3. Performance
- ✅ Latency ต่ำ (< 100ms)
- ✅ Throughput สูง (> 1000 events/sec)
- ✅ Memory usage ปกติ

## 🚨 การแก้ไขปัญหา

### 1. Connection Issues
```bash
# ตรวจสอบ Kafka status
docker exec farmiq-kafka kafka-topics.sh --bootstrap-server localhost:9092 --list

# ตรวจสอบ network
docker network ls | grep farmiq
```

### 2. Topic Issues
```bash
# ตรวจสอบ topics
docker exec farmiq-kafka kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic sensors.device.readings.v1

# สร้าง topics ใหม่
docker exec farmiq-kafka-init-topics /create-kafka-topics.sh
```

### 3. Consumer Issues
```bash
# ตรวจสอบ consumer groups
docker exec farmiq-kafka kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list

# ตรวจสอบ consumer lag
docker exec farmiq-kafka kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group sensor-streamer-group
```

## 📝 หมายเหตุ

- ทดสอบนี้จะส่ง test data ไปยัง topics จริง
- ควรรันใน development environment เท่านั้น
- ตรวจสอบ logs เสมอเมื่อมีปัญหา
- ใช้ `Ctrl+C` เพื่อหยุดการทดสอบ

## 🔗 ลิงก์ที่เกี่ยวข้อง

- [Kafka Complete Guide](../../docs/cloud/Kafka-Complete-Guide.md)
- [Docker Compose Configuration](../../docker-compose.apps.yml)
- [Sensor Streamer Service README](./README.md)
