# Weight Associator Service

Edge service สำหรับเชื่อมโยงข้อมูลน้ำหนักกับภาพในระบบ FarmIQ

## ฟีเจอร์หลัก

- รับข้อมูลภาพจาก MQTT topic `image.created`
- ค้นหาข้อมูลน้ำหนักที่ใกล้เคียงที่สุดในเวลาที่กำหนด
- ส่งข้อมูลการเชื่อมโยงผ่าน MQTT topic `weight.associated`
- รองรับหลายกลยุทธ์การจับคู่ (closest, average, latest)
- บันทึกข้อมูลลง TimescaleDB

## การติดตั้ง

### Prerequisites

- Node.js 20+
- Yarn
- TimescaleDB
- MQTT Broker (Mosquitto)

### Environment Variables

คัดลอกไฟล์ `.env.example` เป็น `.env` และแก้ไขค่าต่างๆ:

```bash
cp .env.example .env
```

### การรัน

```bash
# ติดตั้ง dependencies
yarn install

# Generate Prisma client
npx prisma generate

# รันในโหมด development
yarn dev

# รันในโหมด production
yarn build
yarn start
```

### Docker

```bash
# Build image
docker build -t farmiq-weight-associator .

# Run container
docker run -d --name weight-associator \
  --env-file .env \
  -p 6303:6303 \
  farmiq-weight-associator
```

## API Endpoints

### Health Check
- `GET /health` - ตรวจสอบสถานะ service

### Weight Association
- `GET /api/associations` - ดึงรายการการเชื่อมโยงน้ำหนัก
- `GET /api/associations/:id` - ดึงข้อมูลการเชื่อมโยงตาม ID
- `POST /api/associations/match` - จับคู่น้ำหนักกับภาพแบบ manual

## MQTT Topics

### Subscribe
- `image.created` - รับข้อมูลเมื่อมีการสร้างภาพใหม่

### Publish
- `weight.associated` - ส่งเมื่อมีการเชื่อมโยงน้ำหนักกับภาพ
  - Payload: `{media_id, reading_id, weight, delta_ms, time, strategy, match_window_ms}`

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 6303 | Port ของ service |
| `WEIGHT_MATCH_WINDOW_MS` | 5000 | หน้าต่างเวลาสำหรับการจับคู่ (milliseconds) |
| `WEIGHT_STRATEGY` | closest | กลยุทธ์การจับคู่ (closest, average, latest) |
| `IMAGE_CREATED_TOPIC` | image.created | MQTT topic สำหรับรับข้อมูลภาพ |
| `WEIGHT_ASSOCIATED_TOPIC` | weight.associated | MQTT topic สำหรับส่งผลลัพธ์ |

## Weight Matching Strategies

### 1. Closest (Default)
เลือกข้อมูลน้ำหนักที่ใกล้เคียงเวลาของภาพมากที่สุด

### 2. Average
คำนวณค่าเฉลี่ยของข้อมูลน้ำหนักในหน้าต่างเวลา

### 3. Latest
เลือกข้อมูลน้ำหนักล่าสุดในหน้าต่างเวลา

## Database Schema

Service ใช้ TimescaleDB กับ schema `sensors`:

- `sensors.sensor_readings` - ข้อมูล sensor readings (รวมน้ำหนัก)
- `sensors.media_objects` - ข้อมูลไฟล์ภาพ
- `sensors.weight_mappings` - การเชื่อมโยงระหว่างน้ำหนักและภาพ

## Algorithm Flow

1. รับข้อมูล `image.created` จาก MQTT
2. ค้นหาข้อมูลน้ำหนักในหน้าต่างเวลา `WEIGHT_MATCH_WINDOW_MS`
3. ใช้กลยุทธ์ที่กำหนดในการเลือกข้อมูลน้ำหนัก
4. สร้างการเชื่อมโยงและบันทึกลง database
5. ส่งข้อมูล `weight.associated` ผ่าน MQTT

## API Usage Examples

### Get Associations

```bash
curl http://localhost:6303/api/associations?tenant_id=t1&limit=10
```

### Manual Match

```bash
curl -X POST http://localhost:6303/api/associations/match \
  -H "Content-Type: application/json" \
  -d '{
    "media_id": "media_123",
    "reading_id": "reading_456",
    "strategy": "closest"
  }'
```

## Development

### Prisma Commands

```bash
# Generate client
npx prisma generate

# View database
npx prisma studio

# Reset database
npx prisma db push --force-reset
```

### Testing

```bash
# Run tests
yarn test

# Test MQTT integration
yarn test:mqtt
```

## Performance Tuning

### Database Indexes
- `sensors.sensor_readings(tenant_id, metric, timestamp)` - สำหรับค้นหาข้อมูลน้ำหนัก
- `sensors.media_objects(tenant_id, created_at)` - สำหรับค้นหาภาพ

### Memory Usage
- ใช้ batch processing สำหรับข้อมูลจำนวนมาก
- จำกัดจำนวน records ที่ query ในแต่ละครั้ง

## Troubleshooting

### Common Issues

1. **No Weight Data Found**
   - ตรวจสอบว่ามีข้อมูลน้ำหนักใน database
   - ตรวจสอบ `WEIGHT_MATCH_WINDOW_MS` ว่ากว้างพอ

2. **MQTT Connection Error**
   - ตรวจสอบ `MQTT_BROKER_URL` และ credentials
   - ตรวจสอบว่า MQTT broker ทำงานอยู่

3. **Database Error**
   - ตรวจสอบ `DATABASE_URL` ในไฟล์ `.env`
   - ตรวจสอบว่า TimescaleDB ทำงานอยู่

### Logs

```bash
# ดู logs ของ container
docker logs weight-associator

# ดู logs แบบ real-time
docker logs -f weight-associator
```

## Monitoring

### Metrics
- จำนวนการจับคู่ที่สำเร็จ
- เวลาเฉลี่ยในการประมวลผล
- จำนวนข้อมูลที่จับคู่ไม่ได้

### Alerts
- ไม่พบข้อมูลน้ำหนักในหน้าต่างเวลา
- ข้อผิดพลาดในการเชื่อมต่อ database
- ข้อผิดพลาดในการส่ง MQTT message

## License

MIT