// src/server.ts
import express from "express";
import cors from "cors";
import * as cron from "node-cron";
import { PORT,SYNC_INTERVAL_MINUTES } from "./configs/config";
import { apiKey } from "./middlewares/apiKey";
import { errorHandler } from "./middlewares/errorHandler";
import { runSync } from "./utils/syncJob";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ALLOWED_ORIGINS?.split(","),
    credentials: (process.env.CORS_ALLOW_CREDENTIALS ?? "false") === "true",
    methods: process.env.CORS_ALLOW_METHODS || "GET,POST,OPTIONS",
    allowedHeaders:
      process.env.CORS_ALLOW_HEADERS || "Content-Type,Authorization,x-api-key",
  })
);

// health
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ✅ ไม่ใช้ async และไม่ return res.json()
app.post("/sync/trigger", apiKey, (_req, res) => {
  void runSync(); // fire-and-forget อย่างชัดเจน
  res.json({ ok: true, message: "sync started" });
});

// error handler ต้องอยู่ท้ายสุด
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 sync-service listening on port ${PORT}`);

  const everyMin = SYNC_INTERVAL_MINUTES;
  const expr = `*/${everyMin} * * * *`;

  console.log(`🕒 scheduling sync job: ${expr} (every ${everyMin} minute)`);
  cron.schedule(expr, () => {
    void runSync();
  });

  // run once on boot
  void runSync();
});