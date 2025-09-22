
1. แก้ไข docker-compose.yml
6304 เป็น 6313 ทั้งหมด

2. แก้ไขไฟล์ apiKEY.ts และ swagger.ts

3. :: ดู ENV ทั้งหมด แล้วกรองเฉพาะ API_KEY
docker exec -it image-ingestion sh -lc "printenv" | findstr /I API_KEY

4. เอา API_KEY กลับไปใส่ใน .env device\mock-iot-service\.env --> CAPTURE_INGEST_API_KEY

5. npx prisma generate

6. npx prisma migrate dev --name init