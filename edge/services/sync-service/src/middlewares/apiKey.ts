// src/middleware/apiKey.ts

import { RequestHandler } from "express";
import { SERVICE_API_KEY, REQUIRE_API_KEY } from "../configs/config";

export const apiKey: RequestHandler = (req, res, next) => {
  // dev: ถ้าไม่ enforce หรือไม่มี key → ปล่อยผ่าน
  if (!REQUIRE_API_KEY || !SERVICE_API_KEY) {
    next();
    return;
  }

  const key = (req.header("x-api-key") || (req.query.api_key as string | undefined))?.toString();

  if (!key || key !== SERVICE_API_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return; // ❗ ให้ฟังก์ชันคืนค่า void
  }

  next(); // ❗ อย่าคืนค่า res.*
};


