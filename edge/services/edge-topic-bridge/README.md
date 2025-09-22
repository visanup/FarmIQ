# Edge Topic Bridge

Edge service สำหรับแปลง MQTT topics จากรูปแบบเดิมไปเป็นรูปแบบที่สอดคล้องกับ Cloud specification

## ฟีเจอร์หลัก

- แปลง MQTT topics จากรูปแบบเดิมไปเป็น `edge/*` format
- รองรับการ mapping หลายประเภท (sensor, device, image, weight)
- เติม context ที่ขาดหาย (house, station, run_id)
- รองรับการส่งข้อมูลไปยัง Kafka (optional)
- ใช้ default values สำหรับข้อมูลที่ขาดหาย

## การติดตั้ง

### Prerequisites

- Node.js 20+
- NPM
- MQTT Broker (Mosquitto)
- Kafka (optional)

### Environment Variables

คัดลอกไฟล์ `.env.example` เป็น `.env` และแก้ไขค่าต่างๆ:

```bash
cp .env.example .env
```

### การรัน

```bash
# ติดตั้ง dependencies
npm install

# รันในโหมด development
npm run dev

# รันในโหมด production
npm run build
npm start
```

### Docker

```bash
# Build image
docker build -t farmiq-edge-topic-bridge .

# Run container
docker run -d --name edge-topic-bridge \
  --env-file .env \
  -p 6305:6305 \
  edge-topic-bridge
```

## API Endpoints

### Health Check
- `GET /health` - ตรวจสอบสถานะ service

### Bridge Status
- `GET /api/status` - ตรวจสอบสถานะการทำงานของ bridge
- `GET /api/topics` - ดูรายการ topics ที่ bridge กำลังจัดการ
- `GET /api/stats` - ดูสถิติการแปลง topics

## Topic Mapping

### Input Topics (Subscribe)

#### Sensor Data
- `sensor.clean/{tenant}/{metric}/{deviceId}` → `edge/tele/{tenant}/{house}/lab/{station}/env/{sensor}/{metric}`
- `sensor.anomaly/{tenant}/{metric}/{deviceId}` → `edge/evt/{tenant}/{house}/alert/{alert_type}`

#### Device Management
- `dm/{tenant}/{deviceId}/health` → `edge/stat/{tenant}/{house}/{device_type}/{device_id}` (retained)
- `dm/{tenant}/{deviceId}/lwt` → `edge/stat/{tenant}/{house}/{device_type}/{device_id}` (retained)

#### Media Events
- `image.created` → `edge/evt/{tenant}/{house}/{scope}/camera/{cam_id}/stored`
- `weight.associated` → `edge/evt/{tenant}/{house}/{scope}/weigh/finalized`

### Output Topics (Publish)

#### Telemetry
- `edge/tele/{tenant}/{house}/lab/{station}/env/{sensor}/{metric}`
- `edge/tele/{tenant}/{house}/robot/{robot_id}/run/{run_id}/{sensor}/{metric}`

#### Events
- `edge/evt/{tenant}/{house}/{scope}/camera/{cam_id}/stored`
- `edge/evt/{tenant}/{house}/{scope}/weigh/finalized`
- `edge/evt/{tenant}/{house}/alert/{alert_type}`

#### Status
- `edge/stat/{tenant}/{house}/{device_type}/{device_id}` (retained)

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 6305 | Port ของ service |
| `MQTT_BROKER_URL` | mqtt://edge-mqtt:1883 | URL ของ MQTT broker |
| `MQTT_USER` | edge_bridge | MQTT username |
| `MQTT_PASSWORD` | bridge123 | MQTT password |
| `TOPIC_PREFIX` | edge | Prefix สำหรับ output topics |
| `DEFAULT_TENANT` | t1 | Default tenant ID |
| `DEFAULT_HOUSE` | h01 | Default house ID |
| `ENABLE_KAFKA` | false | เปิดใช้งาน Kafka integration |
| `KAFKA_BROKERS` | | Kafka brokers URLs |

## Context Filling

### Missing Context Resolution

เมื่อ topic เดิมไม่มี context ที่จำเป็น bridge จะเติมจาก:

1. **Payload Data** - ข้อมูลใน message payload
2. **Default Values** - ค่าเริ่มต้นจาก environment variables
3. **Database Lookup** - ค้นหาจาก database (ถ้ามี)

### Example Context Filling

```javascript
// Input: sensor.clean/t1/temperature/device001
// Payload: { value: 25.5, timestamp: "2025-01-20T10:30:00Z" }
// Output: edge/tele/t1/h01/lab/station001/env/device001/temperature
// Filled context: house=h01, station=station001 (from defaults)
```

## Kafka Integration (Optional)

### Kafka Topics

เมื่อเปิดใช้งาน Kafka (`ENABLE_KAFKA=true`):

- `sensors.lab.readings.v1` - Lab sensor readings
- `sensors.sweep.readings.v1` - Robot sweep readings
- `sensors.device.health.v1` - Device health data
- `analytics.anomaly.v1` - Anomaly alerts
- `media.image.stored.v1` - Image storage events

### Data Transformation

```javascript
// MQTT → Kafka transformation
onMqtt('edge/tele/{tenant}/{house}/lab/{station}/env/{sensor}/{metric}', (message) => {
  kafka.produce('sensors.lab.readings.v1', {
    eventType: 'sensor.reading.created',
    version: '1.0',
    timestamp: message.ts,
    data: {
      tenantId: message.tenant,
      houseId: message.house,
      stationId: message.station,
      sensorId: message.sensor,
      metric: message.metric,
      value: message.value,
      unit: message.unit,
      quality: message.quality
    }
  });
});
```

## API Usage Examples

### Check Bridge Status

```bash
curl http://localhost:6305/health
```

### Get Bridge Statistics

```bash
curl http://localhost:6305/api/stats
```

### Test Topic Mapping

```bash
# Publish test message
mosquitto_pub -h localhost -t "sensor.clean/t1/temperature/device001" \
  -m '{"value": 25.5, "timestamp": "2025-01-20T10:30:00Z"}'

# Subscribe to mapped topic
mosquitto_sub -h localhost -t "edge/tele/+/+/lab/+/env/+/+"
```

## Development

### Testing

```bash
# Run tests
npm test

# Test MQTT integration
npm run test:mqtt

# Test Kafka integration
npm run test:kafka
```

### Local Development

```bash
# Start with hot reload
npm run dev

# Watch mode
npm run dev:watch
```

## Migration Strategy

### Phase 1: Bridge Mode
- ใช้ bridge แปลง topics เดิม
- Services ยังคงใช้ topics เดิม
- ตรวจสอบ output topics

### Phase 2: Direct Publishing
- แก้ไข services ให้ publish `edge/*` topics โดยตรง
- ใช้ bridge เป็น fallback
- ตรวจสอบความถูกต้อง

### Phase 3: Bridge Removal
- ลบ bridge ออก
- Services ใช้ `edge/*` topics โดยตรง
- ตรวจสอบระบบทั้งหมด

## Troubleshooting

### Common Issues

1. **MQTT Connection Error**
   - ตรวจสอบ `MQTT_BROKER_URL` และ credentials
   - ตรวจสอบว่า MQTT broker ทำงานอยู่

2. **Topic Mapping Error**
   - ตรวจสอบ input topic format
   - ตรวจสอบ payload structure
   - ดู logs สำหรับ error details

3. **Kafka Connection Error**
   - ตรวจสอบ `KAFKA_BROKERS` configuration
   - ตรวจสอบว่า Kafka ทำงานอยู่

### Logs

```bash
# ดู logs ของ container
docker logs edge-topic-bridge

# ดู logs แบบ real-time
docker logs -f edge-topic-bridge
```

## Monitoring

### Metrics
- จำนวน messages ที่แปลง
- จำนวน errors ในการแปลง
- เวลาเฉลี่ยในการประมวลผล
- Throughput (messages/second)

### Alerts
- MQTT connection failures
- Kafka connection failures (if enabled)
- High error rates
- Missing context warnings

## Performance

### Optimization
- ใช้ connection pooling
- Batch processing สำหรับ Kafka
- Cache สำหรับ context lookup
- Async processing

### Resource Usage
- Memory: ~50MB base + message buffer
- CPU: Low (mostly I/O bound)
- Network: Depends on message volume

## Security

- ใช้ MQTT authentication
- ใช้ Kafka authentication (if enabled)
- จำกัดการเข้าถึงตาม tenant
- Log security events

## License

MIT