// services\sensor-service\src\routes\sensorRoutes.ts

import { Router } from "express";
import { SensorData } from "../models/sensorDataModel";

const router = Router();

// เก็บข้อมูล sensor ล่าสุดไว้ในหน่วยความจำ (ตัวอย่างง่ายๆ)
let latestSensorData: SensorData[] = [];

// API ดึงข้อมูล sensor ล่าสุด
router.get("/latest", (req, res) => {
  res.json({ data: latestSensorData });
});

export function updateSensorData(newData: SensorData) {
  // อัปเดตข้อมูล sensor ล่าสุด (เก็บแค่ 10 รายการล่าสุด)
  latestSensorData.unshift(newData);
  if (latestSensorData.length > 10) {
    latestSensorData.pop();
  }
}

export default router;
