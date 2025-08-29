// src/server.ts
import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { connect } from "mqtt";
import { AppDataSource } from "./utils/dataSource";
import { PORT, WRITE_DB, mqttConnectOptions, SENSOR_RAW_SUB, DM_HEALTH_SUB, DM_LWT_SUB } from "./configs/config";
import { errorHandler } from "./middlewares/errorHandler";
import sensorRoutes, { stashLatest } from "./routes/sensor.route";
import { parseRaw, parseHealth, applyDQ } from "./utils/zod";
import { ingestDeviceReadingSQL, upsertDeviceHealth, saveSweepReading } from "./services/sensor.service";
import { parsePayload } from "./utils/helpers";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/sensor", sensorRoutes);

// Default route
app.get("/", (_req, res) => {
  res.json({ service: "sensor-service", status: "running", timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// MQTT Client setup
const mqttClient = connect(mqttConnectOptions);

mqttClient.on("connect", () => {
  console.log(`📡 MQTT connected: ${mqttConnectOptions.host}:${mqttConnectOptions.port}`);
  
  // Subscribe to sensor raw data
  mqttClient.subscribe(SENSOR_RAW_SUB, (err) => {
    if (err) {
      console.error(`❌ Failed to subscribe to ${SENSOR_RAW_SUB}:`, err);
    } else {
      console.log(`☕ Subscribed: ${SENSOR_RAW_SUB}`);
    }
  });
  
  // Subscribe to device health
  mqttClient.subscribe(DM_HEALTH_SUB, (err) => {
    if (err) {
      console.error(`❌ Failed to subscribe to ${DM_HEALTH_SUB}:`, err);
    } else {
      console.log(`🏥 Subscribed: ${DM_HEALTH_SUB}`);
    }
  });
  
  // Subscribe to device LWT
  mqttClient.subscribe(DM_LWT_SUB, (err) => {
    if (err) {
      console.error(`❌ Failed to subscribe to ${DM_LWT_SUB}:`, err);
    } else {
      console.log(`💀 Subscribed: ${DM_LWT_SUB}`);
    }
  });
});

mqttClient.on("message", async (topic: string, payload: Buffer) => {
  try {
    console.log(`📨 MQTT message received on topic: ${topic}`);
    console.log(`📨 Payload: ${payload.toString()}`);
    
    // Store latest message for debugging
    stashLatest({ topic, payload: payload.toString(), timestamp: new Date().toISOString() });
    
    if (topic.startsWith("sensor.raw/")) {
      await handleSensorRawMessage(topic, payload);
    } else if (topic.includes("/health")) {
      await handleHealthMessage(topic, payload);
    } else {
      console.log(`🤷 Unhandled topic: ${topic}`);
    }
  } catch (error) {
    console.error(`❌ Error processing MQTT message on topic ${topic}:`, error);
  }
});

mqttClient.on("error", (err) => {
  console.error("❌ MQTT error:", err);
});

mqttClient.on("reconnect", () => {
  console.log("🔁 MQTT reconnecting...");
});

// Handle sensor raw messages: sensor.raw/{tenant}/{metric}/{device_id}
async function handleSensorRawMessage(topic: string, payload: Buffer) {
  try {
    const topicParts = topic.split("/");
    if (topicParts.length !== 4) {
      console.error(`❌ Invalid topic format: ${topic}. Expected: sensor.raw/{tenant}/{metric}/{device_id}`);
      return;
    }
    
    // Correct parsing: ["sensor.raw", tenant, metric, deviceId]
    const [, tenant, metric, deviceId] = topicParts;
    
    console.log(`🔍 Processing sensor data - Tenant: ${tenant}, Metric: ${metric}, Device: ${deviceId}`);
    
    // Parse the payload
    const data = parsePayload(payload);
    if (!data) {
      console.error(`❌ Failed to parse payload for topic ${topic}`);
      return;
    }
    
    // Extract value from different possible formats
    let value: number;
    if (typeof data.value === 'number') {
      value = data.value;
    } else if (typeof data.temp === 'number') {
      value = data.temp;
    } else if (typeof data.temperature === 'number') {
      value = data.temperature;
    } else {
      console.error(`❌ No valid numeric value found in payload:`, data);
      return;
    }
    
    console.log(`📊 Extracted value: ${value} for metric: ${metric.toUpperCase()}`);
    
    // Apply data quality checks
    const dqResult = applyDQ(metric.toUpperCase(), value);
    console.log(`🔍 Data quality result:`, dqResult);
    
    const timestamp = data.ts ? new Date(data.ts) : new Date();
    
    // If WRITE_DB is enabled, save to database
    if (WRITE_DB) {
      try {
        if (data.run_id) {
          // Save as sweep reading (robot data)
          await saveSweepReading({
            time: timestamp,
            tenantId: tenant,
            robotId: deviceId,
            runId: data.run_id,
            sensorId: data.sensor_id || deviceId,
            metric: metric.toUpperCase(),
            zoneId: data.zone_id,
            x: data.x,
            y: data.y,
            value,
            quality: dqResult.quality,
            payload: data
          });
          console.log(`✅ Saved sweep reading to database`);
        } else {
          // Save as device reading (general sensor data)
          await ingestDeviceReadingSQL({
            tenantId: tenant,
            deviceId: deviceId,
            time: timestamp,
            sensorId: data.sensor_id || null,
            metric: metric.toUpperCase(),
            value,
            quality: dqResult.quality === 'clean' ? 'raw' : dqResult.quality,
            payload: data
          });
          console.log(`✅ Saved device reading to database - tenant: ${tenant}, device: ${deviceId}, metric: ${metric.toUpperCase()}, value: ${value}`);
        }
      } catch (dbError) {
        console.error(`❌ Database error:`, dbError);
      }
    } else {
      console.log(`ℹ️ WRITE_DB is disabled, skipping database write`);
    }
    
  } catch (error) {
    console.error(`❌ Error handling sensor raw message:`, error);
  }
}

// Handle health messages: dm/{tenant}/{device_id}/health
async function handleHealthMessage(topic: string, payload: Buffer) {
  try {
    const topicParts = topic.split("/");
    if (topicParts.length !== 4) {
      console.error(`❌ Invalid health topic format: ${topic}`);
      return;
    }
    
    const [, tenant, deviceId] = topicParts;
    
    const healthData = parseHealth(payload);
    if (!healthData) {
      console.error(`❌ Failed to parse health payload for topic ${topic}`);
      return;
    }
    
    if (WRITE_DB) {
      try {
        await upsertDeviceHealth({
          time: healthData.ts || new Date(),
          tenantId: tenant,
          deviceId: deviceId,
          online: healthData.online,
          rssi: healthData.rssi,
          uptimeS: healthData.uptime_s,
          meta: healthData
        });
        console.log(`✅ Saved device health to database`);
      } catch (dbError) {
        console.error(`❌ Database error saving health:`, dbError);
      }
    }
  } catch (error) {
    console.error(`❌ Error handling health message:`, error);
  }
}

// Initialize database and start server
async function startServer() {
  try {
    console.log(`🔌 Initializing database connection...`);
    await AppDataSource.initialize();
    console.log(`✅ Database connected`);
    
    app.listen(PORT, () => {
      console.log(`🚀 sensor-service running on http://0.0.0.0:${PORT}`);
      console.log(`📊 WRITE_DB: ${WRITE_DB}`);
    });
  } catch (error) {
    console.error(`❌ Failed to start server:`, error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  mqttClient.end();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  mqttClient.end();
  process.exit(0);
});

startServer();

