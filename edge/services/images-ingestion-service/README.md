# Images Ingestion Service

Edge service สำหรับรับและจัดการไฟล์ภาพในระบบ FarmIQ

## ฟีเจอร์หลัก

- รับไฟล์ภาพผ่าน HTTP API
- บันทึกไฟล์ลง MinIO object storage
- ส่ง metadata ผ่าน MQTT
- รองรับหลายรูปแบบไฟล์ (JPG, PNG, WebP)
- เชื่อมต่อกับ TimescaleDB สำหรับ metadata

## การติดตั้ง

### Prerequisites

- Node.js 20+
- Yarn
- MinIO
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
docker build -t farmiq-images-ingestion .

# Run container
docker run -d --name image-ingestion \
  --env-file .env \
  -p 6313:6313 \
  farmiq-images-ingestion
```

## API Endpoints

### Health Check
- `GET /health` - ตรวจสอบสถานะ service

### Image Upload
- `POST /api/upload` - อัปโหลดไฟล์ภาพ
  - Content-Type: `multipart/form-data`
  - Fields: `file`, `tenant_id`, `robot_id`, `station_id`, `sensor_id`, `metric`

### Media Management
- `GET /api/media` - ดึงรายการไฟล์ภาพ
- `GET /api/media/:id` - ดึงข้อมูลไฟล์ภาพตาม ID
- `DELETE /api/media/:id` - ลบไฟล์ภาพ

## MQTT Topics

### Publish
- `image.created` - ส่งเมื่อมีการสร้างไฟล์ภาพใหม่
  - Payload: `{tenant_id, robot_id, station_id, sensor_id, metric, media_id, sha256, time, width, height, objectKey}`

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 6304 | Port ของ service |
| `MINIO_ENDPOINT` | http://minio:9000 | URL ของ MinIO server |
| `MINIO_BUCKET_RAW` | raw | ชื่อ bucket สำหรับเก็บไฟล์ภาพ |
| `IMAGE_MAX_SIZE_MB` | 10 | ขนาดไฟล์สูงสุด (MB) |
| `ALLOWED_EXTENSIONS` | jpg,jpeg,png,webp | รูปแบบไฟล์ที่อนุญาต |
| `ROUTING_KEY` | image.created | MQTT topic สำหรับส่ง event |

## Database Schema

Service ใช้ TimescaleDB กับ schema `sensors`:

- `sensors.media_objects` - ข้อมูลไฟล์ภาพ
- `sensors.reading_media_map` - การเชื่อมโยงระหว่าง readings และ media

## MinIO Configuration

### Buckets
- `raw` - เก็บไฟล์ภาพต้นฉบับ
- `datasets` - เก็บไฟล์สำหรับ training datasets
- `models` - เก็บไฟล์ model files

### Object Naming
ไฟล์จะถูกเก็บในรูปแบบ:
```
{tenant_id}/{robot_id|station_id}/{sensor_id}/{timestamp}_{uuid}.{ext}
```

## API Usage Examples

### Upload Image

```bash
curl -X POST http://localhost:6313/api/upload \
  -F "file=@image.jpg" \
  -F "tenant_id=t1" \
  -F "robot_id=r001" \
  -F "sensor_id=cam001" \
  -F "metric=image"
```

### Get Media List

```bash
curl http://localhost:6313/api/media?tenant_id=t1&limit=10
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

# Test upload endpoint
curl -X POST http://localhost:6313/api/upload \
  -F "file=@test-image.jpg" \
  -F "tenant_id=test" \
  -F "robot_id=test-robot"
```

## Troubleshooting

### Common Issues

1. **MinIO Connection Error**
   - ตรวจสอบ `MINIO_ENDPOINT` และ credentials
   - ตรวจสอบว่า MinIO ทำงานอยู่

2. **File Upload Error**
   - ตรวจสอบขนาดไฟล์ไม่เกิน `IMAGE_MAX_SIZE_MB`
   - ตรวจสอบรูปแบบไฟล์ใน `ALLOWED_EXTENSIONS`

3. **Database Error**
   - ตรวจสอบ `DATABASE_URL` ในไฟล์ `.env`
   - ตรวจสอบว่า TimescaleDB ทำงานอยู่

### Logs

```bash
# ดู logs ของ container
docker logs image-ingestion

# ดู logs แบบ real-time
docker logs -f image-ingestion
```

## Security

- ไฟล์จะถูกตรวจสอบ MIME type
- รองรับการจำกัดขนาดไฟล์
- ใช้ SHA256 สำหรับ checksum
- รองรับการตั้งค่า CORS

## License

MIT