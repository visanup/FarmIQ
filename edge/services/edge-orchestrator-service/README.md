# Edge Orchestrator Service

Edge service สำหรับจัดการและประสานงานการทำงานของระบบ FarmIQ ฝั่ง Edge

## ฟีเจอร์หลัก

- จัดการ datasets และ model deployment
- ประสานงานระหว่าง services ต่างๆ
- จัดการไฟล์ใน MinIO object storage
- รองรับ vision inference service
- ส่งข้อมูลผ่าน MQTT

## การติดตั้ง

### Prerequisites

- Node.js 20+
- Yarn
- TimescaleDB
- MinIO
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
docker build -t farmiq-edge-orchestrator .

# Run container
docker run -d --name edge-orchestrator \
  --env-file .env \
  -p 6301:6301 \
  farmiq-edge-orchestrator
```

## API Endpoints

### Health Check
- `GET /health` - ตรวจสอบสถานะ service

### Datasets Management
- `GET /api/datasets` - ดึงรายการ datasets
- `POST /api/datasets` - สร้าง dataset ใหม่
- `GET /api/datasets/:id` - ดึงข้อมูล dataset ตาม ID
- `PUT /api/datasets/:id` - อัปเดต dataset
- `DELETE /api/datasets/:id` - ลบ dataset
- `POST /api/datasets/:id/export` - Export dataset

### Models Management
- `GET /api/models` - ดึงรายการ models
- `POST /api/models` - สร้าง model ใหม่
- `GET /api/models/:id` - ดึงข้อมูล model ตาม ID
- `PUT /api/models/:id` - อัปเดต model
- `DELETE /api/models/:id` - ลบ model
- `POST /api/models/:id/deploy` - Deploy model

### Inference
- `POST /api/infer` - รัน inference บนภาพ
- `GET /api/infer/status/:jobId` - ตรวจสอบสถานะ inference job

## MQTT Topics

### Publish
- `edge/datasets/ready` - ส่งเมื่อ dataset พร้อมใช้งาน
- `edge/model/deploy.done` - ส่งเมื่อ model deployment เสร็จสิ้น

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 6301 | Port ของ service |
| `MINIO_ENDPOINT` | http://minio:9000 | URL ของ MinIO server |
| `MINIO_BUCKET_RAW` | raw | Bucket สำหรับไฟล์ภาพต้นฉบับ |
| `MINIO_BUCKET_DATASETS` | datasets | Bucket สำหรับ datasets |
| `MINIO_BUCKET_MODELS` | models | Bucket สำหรับ model files |
| `INFERENCE_BASE_URL` | http://vision-inference-service:6314 | URL ของ inference service |

## MinIO Buckets

### raw
เก็บไฟล์ภาพต้นฉบับที่อัปโหลดจาก devices

### datasets
เก็บไฟล์ datasets ที่เตรียมสำหรับ training:
- `{tenant_id}/datasets/{dataset_id}/images/` - ไฟล์ภาพ
- `{tenant_id}/datasets/{dataset_id}/labels/` - ไฟล์ labels
- `{tenant_id}/datasets/{dataset_id}/metadata.json` - ข้อมูล metadata

### models
เก็บไฟล์ models ที่ deploy แล้ว:
- `{tenant_id}/models/{model_id}/model.onnx` - ONNX model file
- `{tenant_id}/models/{model_id}/config.json` - Model configuration
- `{tenant_id}/models/{model_id}/labels.txt` - Class labels

## Database Schema

Service ใช้ TimescaleDB กับ schema `sensors`:

- `sensors.dataset_exports` - ข้อมูล dataset exports
- `sensors.model_registry` - ข้อมูล models
- `sensors.media_objects` - ข้อมูลไฟล์ภาพ
- `sensors.weight_mappings` - การเชื่อมโยงน้ำหนักและภาพ

## API Usage Examples

### Create Dataset

```bash
curl -X POST http://localhost:6301/api/datasets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Farm Images Dataset",
    "description": "Dataset for farm image classification",
    "tenant_id": "t1",
    "tags": ["agriculture", "crops"]
  }'
```

### Deploy Model

```bash
curl -X POST http://localhost:6301/api/models/123/deploy \
  -H "Content-Type: application/json" \
  -d '{
    "version": "1.0.0",
    "config": {
      "input_size": [224, 224, 3],
      "classes": ["healthy", "diseased", "pest_damage"]
    }
  }'
```

### Run Inference

```bash
curl -X POST http://localhost:6301/api/infer \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "http://minio:9000/raw/t1/images/image123.jpg",
    "model_id": "model_123",
    "tenant_id": "t1"
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

# Test MinIO integration
yarn test:minio

# Test MQTT integration
yarn test:mqtt
```

## File Management

### Dataset Export Process

1. รับ request export dataset
2. สร้าง folder structure ใน MinIO
3. คัดลอกไฟล์ภาพและ labels
4. สร้าง metadata.json
5. ส่ง MQTT event `edge/datasets/ready`

### Model Deployment Process

1. รับ model file และ configuration
2. ตรวจสอบ format และ compatibility
3. บันทึกลง MinIO bucket `models`
4. อัปเดต model registry
5. ส่ง MQTT event `edge/model/deploy.done`

## Troubleshooting

### Common Issues

1. **MinIO Connection Error**
   - ตรวจสอบ `MINIO_ENDPOINT` และ credentials
   - ตรวจสอบว่า MinIO ทำงานอยู่

2. **Inference Service Error**
   - ตรวจสอบ `INFERENCE_BASE_URL`
   - ตรวจสอบว่า vision-inference-service ทำงานอยู่

3. **Database Error**
   - ตรวจสอบ `DATABASE_URL` ในไฟล์ `.env`
   - ตรวจสอบว่า TimescaleDB ทำงานอยู่

### Logs

```bash
# ดู logs ของ container
docker logs edge-orchestrator

# ดู logs แบบ real-time
docker logs -f edge-orchestrator
```

## Monitoring

### Metrics
- จำนวน datasets ที่สร้าง
- จำนวน models ที่ deploy
- เวลาเฉลี่ยในการ export dataset
- อัตราความสำเร็จของ inference

### Health Checks
- MinIO connectivity
- Database connectivity
- MQTT broker connectivity
- Inference service availability

## Security

- ใช้ API key authentication
- จำกัดการเข้าถึงไฟล์ตาม tenant
- ตรวจสอบ file types และ sizes
- ใช้ HTTPS สำหรับ external communications

## License

MIT