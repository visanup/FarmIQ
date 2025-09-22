import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const number = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const bool = (value, fallback = false) => {
  if (value === undefined || value === null) return fallback;
  return String(value).trim().toLowerCase() === 'true';
};

const resolvePath = (maybePath, fallback) =>
  path.resolve(process.cwd(), maybePath ?? fallback);

export const config = {
  mqtt: {
    url: process.env.MQTT_URL ?? 'mqtt://localhost:1883',
    username: process.env.MQTT_USERNAME ?? undefined,
    password: process.env.MQTT_PASSWORD ?? undefined,
  },
  animalsPerHouse: number(process.env.ANIMALS_PER_HOUSE, 450),
  weights: {
    batchSize: number(process.env.WEIGHT_BATCH_SIZE, 20),
    includePrediction: bool(process.env.WEIGHT_INCLUDE_PREDICTION, false),
  },
  timing: {
    envSensorIntervalMs: number(process.env.ENV_SENSOR_INTERVAL_MS, 60000),
    waterSensorIntervalMs: number(process.env.WATER_SENSOR_INTERVAL_MS, 60000),
    weightIntervalMs: number(process.env.WEIGHT_READING_INTERVAL_MS, 60000),
    dayAdvanceIntervalMs: number(process.env.DAY_ADVANCE_INTERVAL_MS, 3600000),
  },
  growth: {
    startWeightKg: number(process.env.START_WEIGHT_KG, 0.8),
    targetWeightKg: number(process.env.TARGET_WEIGHT_KG, 2.95),
    growthDays: number(process.env.GROWTH_DAYS, 60),
  },
  vision: {
    enabled: bool(process.env.VISION_INFERENCE_ENABLED, false),
    url: process.env.VISION_INFERENCE_URL ?? 'http://localhost:6306/inference',
  },
  capture: {
    // default disabled to avoid unintended uploads in dev
    enabled: bool(process.env.CAPTURE_ENABLED, false),
    mediaDir: resolvePath(process.env.CAPTURE_MEDIA_DIR, 'tmp/mock-capture'),
    // Use the correct image ingestion route
    ingestUrl: process.env.CAPTURE_INGEST_URL ?? 'http://localhost:6313/api/ingest/image',
    ingestApiKey: process.env.CAPTURE_INGEST_API_KEY ?? '',
    imageMetric: process.env.CAPTURE_IMAGE_METRIC ?? 'image',
  },
  features: {
    environmentSensors: bool(process.env.ENV_SENSORS_ENABLED, true),
    waterSensors: bool(process.env.WATER_SENSORS_ENABLED, true),
    feedSensor: bool(process.env.FEED_SENSOR_ENABLED, true),
  },
};
