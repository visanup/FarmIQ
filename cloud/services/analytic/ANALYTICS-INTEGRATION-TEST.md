# Analytics Services Integration Test

เอกสารนี้อธิบายการทดสอบการทำงานของ analytics services กับ Kafka topics ใหม่

## 🧪 การทดสอบ

### 1. เริ่มต้นระบบ Infrastructure

```bash
# เริ่ม Kafka และสร้าง topics อัตโนมัติ
cd ../../
docker-compose -f docker-compose.infra.yml up -d

# ตรวจสอบสถานะ
docker-compose -f docker-compose.infra.yml ps
```

### 2. ทดสอบ Analytics Integration

```bash
# วิธีที่ 1: รันโดยตรง
node test-analytics-integration.js

# วิธีที่ 2: ใช้ environment variables
KAFKA_BROKERS=kafka:9092 node test-analytics-integration.js
```

### 3. ทดสอบผ่าน Docker

```bash
# Build และรัน analytics services
docker-compose -f docker-compose.apps.yml up -d analytics-stream analytics-alerts analytics-api analytics-worker

# ตรวจสอบ logs
docker-compose -f docker-compose.apps.yml logs -f analytics-stream

# ทดสอบ integration
docker exec farmiq-analytics-stream node test-analytics-integration.js
```

## 📋 Topics ที่ทดสอบ

### 1. Sensor Data Topics
- `sensors.device.readings.v1` - ข้อมูลเซ็นเซอร์แบบ real-time
- `sensors.device.health.v1` - สถานะสุขภาพอุปกรณ์
- `sensors.lab.readings.v1` - ข้อมูลการทดสอบในห้องปฏิบัติการ
- `sensors.sweep.readings.v1` - ข้อมูลการสแกน/กวาด

### 2. Master Data Topics
- `master.customer.snapshot.v1` - ข้อมูลลูกค้า
- `master.device.snapshot.v1` - ข้อมูลอุปกรณ์
- `master.farm.snapshot.v1` - ข้อมูลฟาร์ม
- `master.house.snapshot.v1` - ข้อมูลโรงเรือน
- `master.flock.snapshot.v1` - ข้อมูลฝูงสัตว์
- `master.animal-type.snapshot.v1` - ข้อมูลประเภทสัตว์
- `master.breed.snapshot.v1` - ข้อมูลสายพันธุ์

### 3. Farm Operational Topics
- `farms.operational.event.v1` - เหตุการณ์การดำเนินงานฟาร์ม
- `farms.farm.snapshot.v1` - Snapshot ข้อมูลฟาร์ม
- `farms.house.snapshot.v1` - Snapshot ข้อมูลโรงเรือน
- `farms.flock.snapshot.v1` - Snapshot ข้อมูลฝูงสัตว์

### 4. Feed Management Topics
- `feed.batch.created.v1` - การสร้าง batch อาหาร
- `feed.quality.result.v1` - ผลการทดสอบคุณภาพอาหาร

### 5. Economics Topics
- `economics.cost.txn.v1` - ข้อมูลต้นทุนและการทำธุรกรรม

### 6. External Data Topics
- `external.weather.observation.v1` - ข้อมูลสภาพอากาศ

### 7. Analytics Topics
- `analytics.features` - ข้อมูล features สำหรับ analytics
- `analytics.prediction.v1` - ผลการทำนาย ML
- `analytics.anomaly.v1` - ผลการตรวจจับความผิดปกติ
- `analytics.invalid-readings` - Dead letter queue

### 8. Device Management Topics
- `devices.device.snapshot.v1` - Snapshot การตั้งค่าอุปกรณ์

## 🔧 Configuration

### Environment Variables

```bash
# Kafka Configuration
KAFKA_BROKERS=kafka:9092
KAFKA_CLIENT_ID=analytics-test
CONSUMER_GROUP=analytics-test-group

# Analytics Stream Service
TOPIC_MASTER_CUSTOMER=master.customer.snapshot.v1
TOPIC_MASTER_DEVICE=master.device.snapshot.v1
TOPIC_MASTER_FARM=master.farm.snapshot.v1
TOPIC_MASTER_HOUSE=master.house.snapshot.v1
TOPIC_MASTER_FLOCK=master.flock.snapshot.v1
TOPIC_MASTER_ANIMAL_TYPE=master.animal-type.snapshot.v1
TOPIC_MASTER_BREED=master.breed.snapshot.v1
KAFKA_TOPICS_IN=sensors.device.readings.v1,sensors.device.health.v1,...
KAFKA_TOPIC_OUT=analytics.features
KAFKA_TOPIC_DLQ=analytics.invalid-readings

# Analytics Alerts Service
TOPIC_ANALYTICS_FEATURES=analytics.features
TOPIC_ANALYTICS_PREDICTIONS=analytics.prediction.v1
TOPIC_ANALYTICS_ANOMALIES=analytics.anomaly.v1
TOPIC_ANALYTICS_DLQ=analytics.invalid-readings

# Analytics API & Worker Services
KAFKA_TOPICS=sensors.device.readings.v1,sensors.device.health.v1,...
```

## 📊 ผลลัพธ์ที่คาดหวัง

### 1. Topic Existence Test
- ✅ ทุก topics ต้องมีอยู่
- ✅ Topics ต้องมี configuration ที่ถูกต้อง
- ✅ Partitions และ replication factor ถูกต้อง

### 2. Message Publishing Test
- ✅ Events ถูกส่งไปยัง topics ที่ถูกต้อง
- ✅ Event schema ถูกต้องตามมาตรฐาน
- ✅ Headers และ metadata ครบถ้วน
- ✅ Retry mechanism ทำงานได้

### 3. Message Consumption Test
- ✅ Events ถูก consume ได้ถูกต้อง
- ✅ Event parsing ทำงานได้
- ✅ Error handling ทำงานได้

### 4. Service Integration Test
- ✅ Analytics-stream รับข้อมูลจาก sensor topics
- ✅ Analytics-stream ส่งข้อมูลไปยัง analytics topics
- ✅ Analytics-alerts รับข้อมูลจาก analytics topics
- ✅ Analytics-api และ analytics-worker ทำงานได้

## 🚨 การแก้ไขปัญหา

### 1. Topic ไม่มีอยู่
```bash
# ตรวจสอบ topics
docker exec farmiq-kafka kafka-topics.sh --bootstrap-server localhost:9092 --list

# สร้าง topics ใหม่
docker exec farmiq-kafka-init-topics /create-kafka-topics.sh
```

### 2. Service ไม่สามารถ connect Kafka
```bash
# ตรวจสอบ Kafka status
docker exec farmiq-kafka kafka-topics.sh --bootstrap-server localhost:9092 --list

# ตรวจสอบ network
docker network ls | grep farmiq
```

### 3. Consumer ไม่ได้รับ messages
```bash
# ตรวจสอบ consumer groups
docker exec farmiq-kafka kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list

# ตรวจสอบ consumer lag
docker exec farmiq-kafka kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group analytics-test-group
```

### 4. Configuration Issues
```bash
# ตรวจสอบ environment variables
docker exec farmiq-analytics-stream env | grep KAFKA
docker exec farmiq-analytics-stream env | grep TOPIC

# ตรวจสอบ logs
docker-compose -f docker-compose.apps.yml logs analytics-stream
```

## 📝 หมายเหตุ

- ทดสอบนี้จะส่ง test data ไปยัง topics จริง
- ควรรันใน development environment เท่านั้น
- ตรวจสอบ logs เสมอเมื่อมีปัญหา
- ใช้ `Ctrl+C` เพื่อหยุดการทดสอบ

## 🔗 ลิงก์ที่เกี่ยวข้อง

- [Kafka Complete Guide](../../docs/cloud/Kafka-Complete-Guide.md)
- [Docker Compose Configuration](../../docker-compose.apps.yml)
- [Analytics Services README](./README.md)
