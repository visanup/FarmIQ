// src/server.ts
import express, { Request, Response } from "express";
import cors from "cors";
import * as cron from "node-cron";
import dotenv from "dotenv";
import sensorRoutes from "./routes/sensorRoutes";
import { runSync } from "./utils/syncJob";
import { PORT } from "./configs/config";

// Load env
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ALLOWED_ORIGINS?.split(","),
  credentials: process.env.CORS_ALLOW_CREDENTIALS === "true",
  methods: process.env.CORS_ALLOW_METHODS,
  allowedHeaders: process.env.CORS_ALLOW_HEADERS,
}));

// Routes
app.use("/sensors", sensorRoutes);

// Healthcheck
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 sync-service listening on port ${PORT}`);

  // Schedule sync (every N minutes)
  const interval = Number(process.env.SYNC_INTERVAL_MINUTES) || 1;
  const cronExpr = `*/${interval} * * * *`;
  cron.schedule(cronExpr, () => {
    console.log(`🕒 Running sync job every ${interval} minute(s)`);
    runSync();
  });
});

// Trigger immediate sync on startup
runSync();
