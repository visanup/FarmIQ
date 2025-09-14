# Monitoring Service Integration Test

เอกสารนี้อธิบายการทดสอบการทำงานของ monitoring service กับ Kafka topics ใหม่

## 🧪 การทดสอบ

### 1. เริ่มต้นระบบ Infrastructure

```bash
# เริ่ม Kafka และสร้าง topics อัตโนมัติ
cd ../../
docker-compose -f docker-compose.infra.yml up -d

# ตรวจสอบสถานะ
docker-compose -f docker-compose.infra.yml ps
```

### 2. ทดสอบ Monitoring Integration

```bash
# วิธีที่ 1: รันโดยตรง
node test-monitoring-integration.js

# วิธีที่ 2: ใช้ npm script
npm run test:kafka

# วิธีที่ 3: ใช้ environment variables
KAFKA_BROKERS=kafka:9092 node test-monitoring-integration.js
```

### 3. ทดสอบผ่าน Docker

```bash
# Build และรัน monitoring service
docker-compose -f docker-compose.apps.yml up -d monitoring-service

# ตรวจสอบ logs
docker-compose -f docker-compose.apps.yml logs -f monitoring-service

# ทดสอบ integration
docker exec farmiq-monitoring-service node test-monitoring-integration.js
```

## 📋 Topics ที่ทดสอบ

### 1. Input Topics (รับข้อมูลจาก services อื่น)
- `sensors.device.health.v1` - สถานะสุขภาพอุปกรณ์จาก sensor-streamer
- `analytics.anomaly.v1` - ผลการตรวจจับความผิดปกติจาก analytics

### 2. Output Topics (ส่งข้อมูลไปยัง services อื่น)
- `monitoring.alerts.v1` - แจ้งเตือนและ alerts
- `monitoring.health.v1` - สถานะสุขภาพของ monitoring service

## 🔧 Configuration

### Environment Variables

```bash
# Kafka Configuration
KAFKA_BROKERS=kafka:9092
KAFKA_CLIENT_ID=monitoring-service
CONSUMER_GROUP=monitoring-group

# Kafka Topics
TOPIC_DEVICE_HEALTH=sensors.device.health.v1
TOPIC_ANALYTICS_ALERTS=analytics.anomaly.v1
TOPIC_MONITORING_ALERTS=monitoring.alerts.v1
TOPIC_MONITORING_HEALTH=monitoring.health.v1

# Database
DATABASE_URL=postgresql://postgres:postgres1611@postgres:5432/farmiq_cloud?schema=monitoring

# JWT
JWT_SECRET=monitoring-service-secret

# CORS
CORS_ALLOWED_ORIGINS=*
CORS_ALLOW_CREDENTIALS=false
CORS_ALLOW_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOW_HEADERS=Content-Type,Authorization
```

## 📊 ผลลัพธ์ที่คาดหวัง

### 1. Topic Existence Test
- ✅ `sensors.device.health.v1` - รับข้อมูลสุขภาพอุปกรณ์
- ✅ `analytics.anomaly.v1` - รับข้อมูลความผิดปกติ
- ✅ `monitoring.alerts.v1` - ส่งข้อมูล alerts
- ✅ `monitoring.health.v1` - ส่งข้อมูลสถานะสุขภาพ

### 2. Message Publishing Test
- ✅ Device Health Events ถูกส่งไปยัง `sensors.device.health.v1`
- ✅ Analytics Anomaly Events ถูกส่งไปยัง `analytics.anomaly.v1`
- ✅ Monitoring Alert Events ถูกส่งไปยัง `monitoring.alerts.v1`
- ✅ Monitoring Health Events ถูกส่งไปยัง `monitoring.health.v1`

### 3. Message Consumption Test
- ✅ Events ถูก consume ได้ถูกต้อง
- ✅ Event parsing ทำงานได้
- ✅ Error handling ทำงานได้

### 4. Service Integration Test
- ✅ Monitoring service รับข้อมูลจาก sensor และ analytics
- ✅ Monitoring service ส่งข้อมูลไปยัง monitoring topics
- ✅ Database integration ทำงานได้
- ✅ API endpoints ทำงานได้

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
docker exec farmiq-kafka kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group monitoring-test-group
```

### 4. Configuration Issues
```bash
# ตรวจสอบ environment variables
docker exec farmiq-monitoring-service env | grep KAFKA
docker exec farmiq-monitoring-service env | grep TOPIC

# ตรวจสอบ logs
docker-compose -f docker-compose.apps.yml logs monitoring-service
```

### 5. Database Issues
```bash
# ตรวจสอบ database connection
docker exec farmiq-monitoring-service node -e "console.log(process.env.DATABASE_URL)"

# ตรวจสอบ database schema
docker exec farmiq-postgres psql -U postgres -d farmiq_cloud -c "\dn"
```

## 🔄 Event Flow

### 1. Device Health Monitoring
```
Sensor Device → sensors.device.health.v1 → Monitoring Service → monitoring.health.v1
```

### 2. Anomaly Detection
```
Analytics Service → analytics.anomaly.v1 → Monitoring Service → monitoring.alerts.v1
```

### 3. Alert Management
```
Monitoring Service → monitoring.alerts.v1 → External Systems (Slack, Email, etc.)
```

## 📝 หมายเหตุ

- ทดสอบนี้จะส่ง test data ไปยัง topics จริง
- ควรรันใน development environment เท่านั้น
- ตรวจสอบ logs เสมอเมื่อมีปัญหา
- ใช้ `Ctrl+C` เพื่อหยุดการทดสอบ

## 🔗 ลิงก์ที่เกี่ยวข้อง

- [Kafka Complete Guide](../../docs/cloud/Kafka-Complete-Guide.md)
- [Docker Compose Configuration](../../docker-compose.apps.yml)
- [Monitoring Service README](./README.md)
