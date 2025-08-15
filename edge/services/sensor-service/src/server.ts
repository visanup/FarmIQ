// services/sensor-service/src/server.ts

import "reflect-metadata";
import express from "express";

// ตรงนี้ import จาก src/config/config.ts
import { mqttClient, PORT } from "./configs/config";
import { AppDataSource } from "./utils/dataSource";
import { parsePayload } from "./utils/helpers";
import sensorRoutes, { updateSensorData } from "./routes/sensorRoutes";
import { SensorData } from "./models/sensorDataModel";

async function bootstrap() {
  // 1. เชื่อมต่อฐานข้อมูล
  await AppDataSource.initialize();
  console.log("🔗 Database connected");

  // 2. subscribe topic ตาม convention
  mqttClient.subscribe("sensor/+/data");
  console.log("☕ Subscribed to sensor/+/data");

  // 3. เมื่อได้ message ให้ parse แล้ว save เข้า DB
  mqttClient.on("message", async (topic, payloadBuf) => {
    const data = parsePayload(payloadBuf);
    if (!data) return;

    const parts = topic.split("/");
    const deviceId = Number(parts[1]);
    if (isNaN(deviceId)) {
      console.warn("Invalid deviceId:", parts[1]);
      return;
    }

    const metric = data.metric as string;
    const value  = Number(data.value);

    const sd = new SensorData();
    sd.time       = new Date();
    sd.deviceId   = deviceId;
    sd.topic      = metric;
    sd.value      = value;
    sd.rawPayload = data;

    try {
      await AppDataSource.manager.save(sd);
      updateSensorData(sd);
      console.log(`💾 [Device ${deviceId}] ${metric} = ${value}`);
    } catch (err) {
      console.error("❌ Error saving to DB:", err);
    }
  });

  // 4. สตาร์ท HTTP server (สำหรับ /sensor/latest)
  const app = express();
  app.use(express.json());
  app.use("/sensor", sensorRoutes);

  app.listen(PORT, () => {
    console.log(`🚀 sensor-service listening on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Bootstrap error:", err);
});