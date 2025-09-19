ช่วยเขียนโดยใช้ภาษา node.js แบบ orm type ปลายทางที่ส่งข้อมูลคือ MQTT_BROKER_URL=mqtt://edge-mqtt:1883

# FARM Ecosystem — mockup Services
mock services ทุกบริการที่อยู่ใน folder นี้ คือการจำลองการส่งข้อมูลออกไปยัง Edge Services เพื่อทำทดสอบโปรแกรม ในช่วง Dev เท่านั้น
1. จำลองการส่งข้อมูลทุก 5 นาที ต่อ Topic คือ TEMP , HUMI , CO2 , NH3 , Intensity

## ยิง reading (sensor) ผ่าน
`TEMP`
docker run --rm --network farmiq-edge_farm_edge eclipse-mosquitto:2.0 mosquitto_pub -h edge-mqtt -p 1883 -u edge_sensor_svc -P admin1234 -q 1 -t "sensor.raw/farm1/TEMP/controller01" -m "{\"value\":25.123456789012345,\"ts\":\"2025-09-18T10:01:00Z\",\"sensor_id\":\"env01\",\"payload\":{\"unit\":\"\\u00B0C\"}}"
`HUMI`
docker run --rm --network farmiq-edge_farm_edge eclipse-mosquitto:2.0 mosquitto_pub -h edge-mqtt -p 1883 -u edge_sensor_svc -P admin1234 -q 1 -t "sensor.raw/farm1/HUMI/controller02" -m "{\"value\":65.123456789012345,\"ts\":\"2025-09-18T16:02:00Z\",\"sensor_id\":\"env01\",\"payload\":{\"unit\":\"\\u00B0C\"}}"

`CO2`
docker run --rm --network farmiq-edge_farm_edge eclipse-mosquitto:2.0 mosquitto_pub -h edge-mqtt -p 1883 -u edge_sensor_svc -P admin1234 -q 1 -t "sensor.raw/farm1/CO2/controller02" -m "{\"value\":999.999999999999999,\"ts\":\"2025-09-18T16:02:00Z\",\"sensor_id\":\"env01\",\"payload\":{\"unit\":\"\\u00B0C\"}}"

`NH3`
docker run --rm --network farmiq-edge_farm_edge eclipse-mosquitto:2.0 mosquitto_pub -h edge-mqtt -p 1883 -u edge_sensor_svc -P admin1234 -q 1 -t "sensor.raw/farm1/NH3/controller02" -m "{\"value\":323.987654321,\"ts\":\"2025-09-18T16:02:00Z\",\"sensor_id\":\"env01\",\"payload\":{\"unit\":\"\\u00B0C\"}}"

`Intensity`
docker run --rm --network farmiq-edge_farm_edge eclipse-mosquitto:2.0 mosquitto_pub -h edge-mqtt -p 1883 -u edge_sensor_svc -P admin1234 -q 1 -t "sensor.raw/farm1/INSENSITY/controller02" -m "{\"value\":111.1111122222,\"ts\":\"2025-09-18T16:02:00Z\",\"sensor_id\":\"env01\",\"payload\":{\"unit\":\"\\u00B0C\"}}"

## Node.js mock service (TypeScript)
- สร้าง service ส่งข้อมูลอัตโนมัติทุก 5 นาที ไปยัง `MQTT_BROKER_URL=mqtt://edge-mqtt:1883`
- Topics ที่ส่ง: `TEMP`, `HUMI`, `CO2`, `NH3`, `INSENSITY` ตามรูปแบบ `sensor.raw/{farm}/{metric}/{controller}`

วิธีใช้งาน
- ติดตั้ง dependencies: `npm install`
- รันแบบพัฒนา: `npm run dev`
- สร้างและรัน: `npm run build` แล้ว `npm start`

ตั้งค่าผ่าน Environment Variables (ดูตัวอย่างไฟล์ `.env.example`)
- `MQTT_BROKER_URL` ค่าเริ่มต้น `mqtt://edge-mqtt:1883`
- `MQTT_USERNAME` ค่าเริ่มต้น `edge_sensor_svc`
- `MQTT_PASSWORD` ค่าเริ่มต้น `admin1234`
- `FARM_ID` ค่าเริ่มต้น `farm1`
- `SENSOR_ID` ค่าเริ่มต้น `env01`
- `INTERVAL_MS` ค่าเริ่มต้น `300000` (5 นาที)
- Controller IDs ต่อ metric (ไม่ระบุก็มีค่าเริ่มต้น): `TEMP_CONTROLLER`, `HUMI_CONTROLLER`, `CO2_CONTROLLER`, `NH3_CONTROLLER`, `INSENSITY_CONTROLLER`

โค้ดหลักอยู่ที่ `src/index.ts:1`

## Docker / Compose
- สร้างไฟล์ `.env` (มีตัวอย่างใน `.env.example`) หรือใช้ค่าที่เตรียมไว้แล้ว
- Build image และรันด้วย Docker Compose (จะเชื่อมต่อ external network ชื่อ `farmiq-edge_farm_edge` เพื่อเข้าถึง broker `edge-mqtt`)

คำสั่ง:
- `docker compose build`
- `docker compose up -d`
- ดู log: `docker compose logs -f`
- หยุด: `docker compose down`

โครงสร้างที่เกี่ยวข้อง:
- `Dockerfile:1` สร้าง image แบบ multi-stage (build + runtime)
- `docker-compose.yml:1` รัน service `mock-sensor` และผูกกับ network ภายนอก `farmiq-edge_farm_edge`
- `.dockerignore:1` กันไฟล์/โฟลเดอร์ไม่จำเป็นออกจาก build context
- `.env:1` ค่า environment ที่ใช้รัน (อย่า commit ความลับจริงขึ้น repo)

## สรุปการแก้ไขในครั้งนี้
- เพิ่มโปรเจค Node.js (TypeScript) สำหรับ mock sensor publisher
- สร้างไฟล์: `package.json:1`, `tsconfig.json:1`, `src/index.ts:1`, `.env.example:1`, `.env:1`
- เพิ่มความสามารถ build/run ด้วย Docker: `Dockerfile:1`, `.dockerignore:1`, `docker-compose.yml:1`
- อัปเดต README นี้ด้วยวิธีใช้งานแบบ Node และ Docker
