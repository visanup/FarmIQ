// src/server.ts
import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import {
  PORT,
  SENSOR_RAW_SUB,
  PUB_NS_CLEAN,
  PUB_NS_ANOMALY,
  PUB_NS_DLQ,
  WRITE_DB,
} from "./configs/config";
import { mqttClient, pubJSON } from "./utils/mqtt";
import { parseRaw, applyDQ } from "./utils/zod";
import sensorRouter, { stashLatest } from "./routes/sensor.route";

// ===== Optional DB (เปิดใช้เมื่อ WRITE_DB=true) =====
let saveReading:
  | ((
      r: {
        time: Date;
        tenant: string;
        deviceId: string;
        metric: string;
        value: number;
        rawPayload?: any;
      }
    ) => Promise<any>)
  | undefined;

async function initDbIfNeeded() {
  if (!WRITE_DB) return;
  const { AppDataSource } = await import("./utils/dataSource");
  const mod = await import("./services/sensor.service");
  await AppDataSource.initialize();
  saveReading = mod.saveReading;
  console.log("🔗 Database connected (WRITE_DB=true)");
}

// sensor.raw/{tenant}/{metric}/{deviceId}
function parseTopic(topic: string) {
  const parts = topic.split("/");
  if (parts.length < 4) return null;
  return { tenant: parts[1], metric: parts[2], deviceId: parts[3] };
}

async function bootstrap() {
  await initDbIfNeeded();

  // Subscribe เมื่อ connect สำเร็จ (ปลอดภัยกว่าและ re-sub อัตโนมัติเมื่อ reconnect)
  mqttClient.on("connect", () => {
    mqttClient.subscribe(SENSOR_RAW_SUB, { qos: 1 }, (err) => {
      if (err) console.error("❌ Subscribe error:", err);
      else console.log(`☕ Subscribed: ${SENSOR_RAW_SUB}`);
    });
  });

  mqttClient.on("message", async (topic, payload) => {
    const tp = parseTopic(topic);
    if (!tp) {
      console.warn("⚠️ Bad topic:", topic);
      return;
    }

    const raw = parseRaw(payload);
    if (!raw) return;

    const ts = raw.ts ?? new Date();
    const dq = applyDQ(tp.metric, raw.value);

    const out = {
      ts,
      tenant: tp.tenant,
      device_id: tp.deviceId,
      metric: tp.metric,
      value: raw.value,
      quality: dq.quality,
      rule_hits: dq.reasons ?? [],
      payload: raw,
    };

    // forward → sensor.clean / sensor.anomaly / sensor.dlq
    const base =
      dq.quality === "clean"
        ? PUB_NS_CLEAN
        : dq.quality === "anomaly"
        ? PUB_NS_ANOMALY
        : PUB_NS_DLQ;

    const outTopic = `${base}/${tp.tenant}/${tp.metric}/${tp.deviceId}`;
    pubJSON(outTopic, out, 1, false);
    stashLatest({ topic: outTopic, data: out });

    // (optional) เขียน DB ใน service นี้ (ระหว่างรอ sync-service)
    if (WRITE_DB && saveReading) {
      try {
        await saveReading({
          time: new Date(ts),
          tenant: tp.tenant,
          deviceId: tp.deviceId,
          metric: tp.metric,
          value: out.value,
          rawPayload: out,
        });
      } catch (e) {
        console.error("❌ DB save error:", e);
      }
    }
  });

  // ===== HTTP =====
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use("/sensor", sensorRouter);

  const server = app.listen(PORT, () =>
    console.log(`🚀 sensor-service http://0.0.0.0:${PORT}`)
  );

  // Graceful shutdown
  const shutdown = (sig: string) => {
    console.log(`\n🛑 Received ${sig}, shutting down...`);
    server.close(() => process.exit(0));
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap().catch((e) => {
  console.error("Bootstrap error:", e);
  process.exit(1);
});
