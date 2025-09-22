1. แก้ไขไฟล์ package.json
  `เดิม`
  "start": "cross-env MQTT_URL=mqtt://localhost:1883 ENV_SENSORS_ENABLED=true ... node src/index.js"
  `ใหม่`
  "start": "cross-env node src/index.js"

2. วิธีการรัน
  - cd D:\Betagro\FarmIQ\device\mock-iot-service
  - npm start