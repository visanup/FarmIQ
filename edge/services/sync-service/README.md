# Sync Service

Edge service สำหรับซิงค์ข้อมูลจาก Edge layer ไปยัง Cloud layer ในระบบ FarmIQ

## ฟีเจอร์หลัก

- ซิงค์ข้อมูล sensor readings ไปยัง Cloud API
- รองรับ batch processing สำหรับประสิทธิภาพ
- จัดการ retry และ error handling
- รองรับหลายประเภทข้อมูล (sensor, lab, device health)
- ใช้ TimescaleDB schema `sensors` ร่วมกับ `sensor-service` (ไม่มีการสร้างฐานข้อมูลแยก)

## การติดตั้ง

### Prerequisites

- Node.js 20+
- Yarn
- TimescaleDB
- Cloud API access

### Environment Variables

คัดลอกไฟล์ `.env.example` เป็น `.env` และแก้ไขค่าต่างๆ:

```bash
cp .env.example .env
```

### การรัน

```bash
# ติดตั้ง dependencies
yarn install

# รันในโหมด development
yarn dev

# รันในโหมด production
yarn build
yarn start
```

### Docker

```bash
# Build image
docker build -t farmiq-sync-service .

# Run container
docker run -d --name sync-service \
  --env-file .env \
  -p 6302:6302 \
  farmiq-sync-service
```

## API Endpoints

### Health Check
- `GET /health` - ตรวจสอบสถานะ service

### Sync Management
- `GET /api/sync/status` - ตรวจสอบสถานะการซิงค์
- `POST /api/sync/trigger` - เริ่มการซิงค์แบบ manual
- `GET /api/sync/history` - ดูประวัติการซิงค์
- `GET /api/sync/stats` - ดูสถิติการซิงค์

### Data Endpoints
- `GET /api/sensor-readings` - ดึงข้อมูล sensor readings
- `GET /api/lab-readings` - ดึงข้อมูล lab readings
- `GET /api/device-health` - ดึงข้อมูล device health

## Cloud API Integration

### Endpoints
- `POST /sweep-readings` - ส่งข้อมูล sensor readings จาก robot sweeps
- `POST /lab-readings` - ส่งข้อมูล lab readings
- `POST /sensor-readings` - ส่งข้อมูล sensor readings ทั่วไป
- `POST /device-health` - ส่งข้อมูล device health

### Data Format

#### Sensor Readings
```json
{
  "tenantId": "t1",
  "houseId": "h01",
  "deviceId": "sensor001",
  "metric": "temperature",
  "value": 25.5,
  "unit": "celsius",
  "timestamp": "2025-01-20T10:30:00Z",
  "quality": "good",
  "location": {
    "x": 10.5,
    "y": 20.3,
    "z": 1.2
  }
}
```

#### Lab Readings
```json
{
  "tenantId": "t1",
  "houseId": "h01",
  "stationId": "lab001",
  "sensorId": "weight001",
  "metric": "WEIGHT",
  "value": 150.5,
  "unit": "kg",
  "timestamp": "2025-01-20T10:30:00Z",
  "mediaId": "media_123",
  "strategy": "closest",
  "matchWindowMs": 5000
}
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 6302 | Port ของ service |
| `CLOUD_API_URL` | http://host.docker.internal:7302/api | URL ของ Cloud API |
| `CLOUD_API_KEY` | admin-key | API key สำหรับ Cloud API |
| `SYNC_BATCH_SIZE` | 100 | จำนวน records ต่อ batch |
| `SYNC_INTERVAL_MS` | 30000 | ช่วงเวลาการซิงค์ (milliseconds) |

## Sync Process

### 1. Data Collection
- Query ข้อมูลจาก TimescaleDB
- กรองข้อมูลที่ยังไม่ได้ซิงค์
- จัดกลุ่มข้อมูลตามประเภท

### 2. Batch Processing
- แบ่งข้อมูลเป็น batches
- ส่งข้อมูลไปยัง Cloud API
- รอ response และประมวลผลผลลัพธ์

### 3. Error Handling
- Retry สำหรับ failed requests
- Log errors สำหรับ debugging
- Mark records ที่ซิงค์สำเร็จแล้ว

### 4. Status Tracking
- บันทึกสถานะการซิงค์
- เก็บสถิติการทำงาน
- รายงาน errors และ warnings

## Database Schema

Service นี้เชื่อมต่อ TimescaleDB ตัวเดียวกับ `sensor-service` และอ่านข้อความจาก schema `sensors` โดยตรง (ไม่มีการสร้าง database ใหม่). ตารางที่ใช้งานได้แก่:

- `sensors.sensor_readings` - ข้อมูล sensor readings
- `sensors.sweep_readings` - ข้อมูล readings จาก robot sweeps
- `sensors.device_health` - ข้อมูล device health
- `sensors.sync_logs` - Log การซิงค์
- `sensors.sync_status` - สถานะการซิงค์

## API Usage Examples

### Check Sync Status

```bash
curl http://localhost:6302/api/sync/status
```

### Trigger Manual Sync

```bash
curl -X POST http://localhost:6302/api/sync/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "dataType": "sensor-readings",
    "tenantId": "t1",
    "limit": 1000
  }'
```

### Get Sync History

```bash
curl "http://localhost:6302/api/sync/history?limit=10&offset=0"
```

## Development

### Testing

```bash
# Run tests
yarn test

# Test Cloud API integration
yarn test:cloud-api

# Test database queries
yarn test:database
```

### Local Development

```bash
# Start with hot reload
yarn dev

# Watch mode
yarn dev:watch
```

## Performance Tuning

### Database Optimization
- ใช้ indexes สำหรับ query patterns
- จำกัดจำนวน records ต่อ query
- ใช้ connection pooling

### Network Optimization
- ใช้ HTTP keep-alive
- Compress data ก่อนส่ง
- ใช้ batch processing

### Memory Management
- จำกัดขนาด batch
- ใช้ streaming สำหรับข้อมูลขนาดใหญ่
- Clean up resources หลังใช้งาน

## Troubleshooting

### Common Issues

1. **Cloud API Connection Error**
   - ตรวจสอบ `CLOUD_API_URL` และ `CLOUD_API_KEY`
   - ตรวจสอบ network connectivity

2. **Database Query Error**
   - ตรวจสอบ `DATABASE_URL` ในไฟล์ `.env`
   - ตรวจสอบว่า TimescaleDB ทำงานอยู่

3. **Sync Performance Issues**
   - ปรับ `SYNC_BATCH_SIZE` และ `SYNC_INTERVAL_MS`
   - ตรวจสอบ database indexes

### Logs

```bash
# ดู logs ของ container
docker logs sync-service

# ดู logs แบบ real-time
docker logs -f sync-service

# ดู sync logs ใน database
docker exec -it timescaledb psql -U postgres -d sensors_db -c "SELECT * FROM sensors.sync_logs ORDER BY created_at DESC LIMIT 10;"
```

## Monitoring

### Metrics
- จำนวน records ที่ซิงค์สำเร็จ
- จำนวน errors และ retries
- เวลาเฉลี่ยในการซิงค์
- Throughput (records/second)

### Alerts
- Cloud API connection failures
- Database connection errors
- High error rates
- Sync delays

## Security

- ใช้ API key authentication
- Encrypt sensitive data
- ใช้ HTTPS สำหรับ external communications
- จำกัดการเข้าถึงตาม tenant

## License

MIT
