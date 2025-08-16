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
import { parseRaw, applyDQ, parseHealth } from "./utils/zod";
import sensorRouter, { stashLatest } from "./routes/sensor.route";

import { AppDataSource } from "./utils/dataSource";
import {
  saveSweepReading,
  upsertDeviceHealth,
  ingestDeviceReadingSQL,
} from "./services/sensor.service";

// เผื่อยังไม่ได้ประกาศใน configs/config.ts — ใช้ค่า env/fallback ที่นี่ได้เลย
const DM_HEALTH_SUB = process.env.DM_HEALTH_SUB || "dm/+/+/health";
const DM_LWT_SUB = process.env.DM_LWT_SUB || "dm/+/+/lwt";

// ----------------- helpers -----------------
function parseSensorTopic(topic: string) {
  // sensor.raw/{tenant}/{metric}/{deviceId}
  const p = topic.split("/");
  if (p.length < 4) return null;
  return { tenant: p[1], metric: p[2], deviceId: p[3] };
}

function parseDmTopic(topic: string) {
  // dm/{tenant}/{deviceId}/health or dm/{tenant}/{deviceId}/lwt
  const p = topic.split("/");
  if (p.length < 4) return null;
  return { tenant: p[1], deviceId: p[2], kind: p[3] as "health" | "lwt" };
}

// ----------------- bootstrap -----------------
async function bootstrap() {
  // 1) DB init (service นี้เขียน DB เอง)
  await AppDataSource.initialize();
  console.log("🔗 Database connected (sensor-service writes)");

  // 2) Subscribe MQTT (บน event 'connect' เพื่อให้ re-subscribe ออโต้ตอน reconnect)
  mqttClient.on("connect", () => {
    mqttClient.subscribe(
      [SENSOR_RAW_SUB, DM_HEALTH_SUB, DM_LWT_SUB],
      { qos: 1 },
      (err, granted = []) => {          // 👈 default เป็น []
        if (err) {
          console.error("❌ Subscribe error:", err);
          return;
        }
        console.log("☕ Subscribed:", granted.map(g => `${g.topic}@${g.qos}`).join(", "));
      }
    );
  });

  // 3) Message handler
  mqttClient.on("message", async (topic, payload) => {
    try {
      // 3.1) Sensor RAW → DQ → publish → write DB
      if (topic.startsWith("sensor.raw/")) {
        const tp = parseSensorTopic(topic);
        if (!tp) return console.warn("⚠️ Bad sensor topic:", topic);

        const raw = parseRaw(payload);
        if (!raw) return;

        const ts = raw.ts ?? new Date();
        const dq = applyDQ(tp.metric, raw.value);

        const out = {
          ts,
          tenant: tp.tenant,
          device_id: tp.deviceId, // สำหรับ robot = robot_id
          metric: tp.metric,
          value: raw.value,
          quality: dq.quality,
          rule_hits: dq.reasons ?? [],
          // run context (ถ้ามี)
          run_id: raw.run_id ?? undefined,
          sensor_id: raw.sensor_id ?? undefined,
          zone_id: raw.zone_id ?? undefined,
          x: raw.x ?? undefined,
          y: raw.y ?? undefined,
          // เก็บ payload ต้นฉบับ (debug/trace)
          payload: raw,
        };

        // forward ตามคุณภาพ
        const base =
          dq.quality === "clean"
            ? PUB_NS_CLEAN
            : dq.quality === "anomaly"
            ? PUB_NS_ANOMALY
            : PUB_NS_DLQ;
        const outTopic = `${base}/${tp.tenant}/${tp.metric}/${tp.deviceId}`;
        pubJSON(outTopic, out, 1, false);
        stashLatest({ topic: outTopic, data: out });

        // เขียน DB ถ้าเปิด
        if (WRITE_DB) {
          if (out.run_id && out.sensor_id) {
            // มี run context → ลง sweep_readings
            await saveSweepReading({
              time: new Date(ts),
              tenantId: tp.tenant,
              robotId: tp.deviceId,
              runId: out.run_id,
              sensorId: out.sensor_id,
              metric: tp.metric,
              zoneId: out.zone_id,
              x: out.x,
              y: out.y,
              value: out.value,
              quality: out.quality as any,
              payload: out,
            });
          } else {
            // ไม่มี run context → ลง device_readings (ผ่านฟังก์ชัน)
            await ingestDeviceReadingSQL({
              tenantId: tp.tenant,
              deviceId: tp.deviceId,
              time: new Date(ts),
              sensorId: out.sensor_id ?? null,
              metric: tp.metric,
              value: out.value,
              quality: out.quality as any,
              payload: out,
            });
          }
        }
        return;
      }

      // 3.2) Device Management: health/LWT → device_health
      if (topic.startsWith("dm/")) {
        const tp = parseDmTopic(topic);
        if (!tp) return console.warn("⚠️ Bad dm topic:", topic);

        const h = parseHealth(payload);
        if (!h) return;

        const ts = h.ts ?? new Date();
        const online = tp.kind === "lwt" ? false : h.online ?? true;

        if (WRITE_DB) {
          await upsertDeviceHealth({
            time: new Date(ts),
            tenantId: tp.tenant,
            deviceId: tp.deviceId,
            online,
            source: tp.kind,
            rssi: h.rssi,
            uptimeS: h.uptime_s,
            meta: h.meta ?? {},
          });
        }
        return;
      }
    } catch (e) {
      console.error("❌ onMessage error:", e);
    }
  });

  // 4) HTTP server
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use("/sensor", sensorRouter);

  app.listen(PORT, () => {
    console.log(`🚀 sensor-service http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((e) => {
  console.error("Bootstrap error:", e);
  process.exit(1);
});

