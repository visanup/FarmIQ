import mqtt, { MqttClient } from "mqtt";

// Environment configuration with sensible defaults
// Default to the broker on 192.168.1.121 for cross-host setups
const MQTT_BROKER_URL =
  process.env.MQTT_BROKER_URL || "mqtt://192.168.1.121:1883";
const MQTT_USERNAME = process.env.MQTT_USERNAME || "edge_sensor_svc";
const MQTT_PASSWORD = process.env.MQTT_PASSWORD || "admin1234";
const FARM_ID = process.env.FARM_ID || "farm1";
const SENSOR_ID = process.env.SENSOR_ID || "env01";
// Interval in ms (default 5 minutes)
const INTERVAL_MS = Number(process.env.INTERVAL_MS || 5 * 60 * 1000);

// Topic: sensor.raw/{farm}/{metric}/{controller}
type Metric = "TEMP" | "HUMI" | "CO2" | "NH3" | "INSENSITY";

const topicControllers: Record<Metric, string> = {
  TEMP: process.env.TEMP_CONTROLLER || "controller01",
  HUMI: process.env.HUMI_CONTROLLER || "controller02",
  CO2: process.env.CO2_CONTROLLER || "controller02",
  NH3: process.env.NH3_CONTROLLER || "controller02",
  INSENSITY: process.env.INSENSITY_CONTROLLER || "controller02",
};

const units: Record<Metric, string> = {
  TEMP: "\u00B0C",
  HUMI: "%",
  CO2: "ppm",
  NH3: "ppm",
  INSENSITY: "lux",
};

type ReadingPayload = {
  value: number;
  ts: string; // ISO 8601 UTC
  sensor_id: string;
  payload: { unit: string };
};

function topicFor(metric: Metric): string {
  const controller = topicControllers[metric];
  return `sensor.raw/${FARM_ID}/${metric}/${controller}`;
}

function nowIsoUtc(): string {
  return new Date().toISOString();
}

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function withPrecision(n: number, digits: number): number {
  return Number(n.toFixed(digits));
}

function generateValue(metric: Metric): number {
  switch (metric) {
    case "TEMP":
      return withPrecision(randomInRange(22, 30), 15);
    case "HUMI":
      return withPrecision(randomInRange(40, 80), 15);
    case "CO2":
      return withPrecision(randomInRange(400, 1200), 15);
    case "NH3":
      return withPrecision(randomInRange(50, 400), 9);
    case "INSENSITY":
      return withPrecision(randomInRange(50, 300), 10);
  }
}

function buildReading(metric: Metric): ReadingPayload {
  return {
    value: generateValue(metric),
    ts: nowIsoUtc(),
    sensor_id: SENSOR_ID,
    payload: { unit: units[metric] },
  };
}

function log(msg: string, ...args: unknown[]) {
  // Simple, prefixed logger
  console.log(`[mockup] ${msg}`, ...args);
}

function connectMqtt(): MqttClient {
  log(`Connecting to MQTT ${MQTT_BROKER_URL} as '${MQTT_USERNAME}'`);
  const client = mqtt.connect(MQTT_BROKER_URL, {
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
    reconnectPeriod: 2000,
    keepalive: 30,
  });

  client.on("connect", () => log("Connected to MQTT broker"));
  client.on("reconnect", () => log("Reconnecting to MQTT broker..."));
  client.on("close", () => log("MQTT connection closed"));
  client.on("error", (err) => log("MQTT error:", err.message));

  return client;
}

function publishOnce(client: MqttClient) {
  const metrics: Metric[] = ["TEMP", "HUMI", "CO2", "NH3", "INSENSITY"];
  for (const metric of metrics) {
    const topic = topicFor(metric);
    const reading = buildReading(metric);
    const payload = JSON.stringify(reading);
    client.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        log(`Publish error to ${topic}:`, err.message);
      } else {
        log(`Published -> ${topic} :: ${payload}`);
      }
    });
  }
}

function start() {
  const client = connectMqtt();

  // Publish immediately once connected
  client.on("connect", () => publishOnce(client));

  // And then every INTERVAL_MS
  const interval = setInterval(() => publishOnce(client), INTERVAL_MS);

  // Graceful shutdown
  const shutdown = () => {
    clearInterval(interval);
    log("Shutting down...");
    try {
      client.end(true, () => process.exit(0));
    } catch {
      process.exit(0);
    }
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start();
