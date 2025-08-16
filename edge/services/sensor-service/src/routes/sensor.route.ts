// src/routes/sensor.route.ts

import { Router } from "express";
import { apiKey } from "../middlewares/apiKey"; // ✅ middleware (ไม่มี s)

const router = Router();

const latestCache: any[] = [];
export function stashLatest(msg: any) {
  latestCache.unshift(msg);
  if (latestCache.length > 50) latestCache.pop();
}

router.get("/health", (_req, res) => res.json({ ok: true }));
router.get("/latest", apiKey, (_req, res) => res.json({ data: latestCache }));

export default router;