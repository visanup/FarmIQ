import { v4 as uuidv4 } from 'uuid';
import { config } from './config.js';
import { hourlySensors, dailySensors, feedSensor } from './sensorCatalog.js';
import { createMqttClient, publishSensor } from './mqttClient.js';
import { makeTopology, randomValue, makeGrowthModel, makeWeightPayloads } from './generators.js';
import { requestInference } from './visionClient.js';
import { emitCapture } from './captureMock.js';

const { client, logger } = createMqttClient();

const contexts = makeTopology().map((ctx) => ({
  ...ctx,
  model: makeGrowthModel(),
  dayIndex: 0,
  animalCursor: 0,
}));

const baseMetadata = (context) => ({
  tenantId: context.tenantId,
  tenantName: context.tenantName,
  farmId: context.farmId,
  farmName: context.farmName,
  houseId: context.houseId,
  houseName: context.houseName,
  flockId: context.flockId,
  deviceId: context.deviceId,
  stationId: context.stationId,
  dayIndex: context.dayIndex,
});

const publish = (context, metric, value, options = {}) => {
  const timestamp = options.timestamp ?? new Date();
  const payload = {
    ts: timestamp.toISOString(),
    tenant: context.tenantId,
    device_id: context.deviceId,
    metric,
    value,
    unit: options.unit ?? options.sensor?.unit ?? null,
    sensor_id: options.sensorId ?? null,
    metadata: {
      ...baseMetadata(context),
      ...options.metadata,
    },
  };

  // Debug logging for sensor data
  logger.info({ 
    msg: '📡 Publishing sensor data', 
    metric, 
    value, 
    unit: options.unit ?? options.sensor?.unit ?? null,
    tenant: context.tenantId,
    device: context.deviceId
  });

  publishSensor(client, {
    tenantId: context.tenantId,
    metric,
    deviceId: context.deviceId,
    payload,
  });
};

const publishEvent = (topic, message) => {
  client.publish(topic, JSON.stringify(message), { qos: 1 }, (err) => {
    if (err) {
      logger.error({ msg: 'Publish event error', topic, err: err.message });
    } else {
      logger.debug({ msg: 'Published event payload', topic });
    }
  });
};

const scheduleEnvironment = (context) => {
  const tick = () => {
    for (const sensor of hourlySensors) {
      const value = randomValue(sensor);
      publish(context, sensor.metric, value, {
        unit: sensor.unit,
        sensorId: `env_${sensor.metric}`,
      });
    }
  };

  tick();
  setInterval(tick, config.timing.envSensorIntervalMs);
};

const scheduleWater = (context) => {
  const tick = () => {
    for (const sensor of dailySensors) {
      const value = randomValue(sensor);
      publish(context, sensor.metric, value, {
        unit: sensor.unit,
        sensorId: `water_${sensor.metric}`,
      });
    }
  };

  tick();
  setInterval(tick, config.timing.waterSensorIntervalMs);
};

const scheduleWeights = (context) => {
  const tick = async () => {
    const animalCount = config.animalsPerHouse;
    const model = context.model;
    const timestamp = new Date();
    context.dayIndex = model.dayIndex;

    if (config.features.feedSensor) {
      const feed = model.feedIntakeKg(animalCount);
      publish(context, feedSensor.metric, feed, {
        unit: feedSensor.unit,
        sensorId: 'feed_intake',
      });
    }

    // Only send weight data if capture is enabled
    if (config.capture.enabled) {
      const batchSize = Math.min(config.weights.batchSize, animalCount);
      const animalIds = [];
      for (let i = 0; i < batchSize; i += 1) {
        const index = (context.animalCursor + i) % animalCount;
        animalIds.push(index + 1);
      }
      context.animalCursor = (context.animalCursor + animalIds.length) % animalCount;

      for (const animalId of animalIds) {
        const sessionId = uuidv4();
        const weightKg = model.weightForAnimal(animalId);
        let predictedKg = weightKg;

        if (config.vision.enabled && config.weights.includePrediction) {
          const inference = await requestInference({
            mediaId: `media-${context.houseId}-${animalId}`,
            tenantId: context.tenantId,
            farmId: context.farmId,
            houseId: context.houseId,
            stationId: context.stationId,
            metadata: {
              approx_weight_kg: weightKg,
              animal_id: animalId,
              source: 'mock-iot-service',
              house_name: context.houseName,
              farm_name: context.farmName,
            },
          }).catch((error) => {
            logger.warn({ msg: 'Vision inference request failed', error: error?.message ?? error });
            return null;
          });

          if (inference?.predicted_weight) {
            predictedKg = inference.predicted_weight;
          }
        }

        const payloads = makeWeightPayloads({
          context,
          animalId,
          weightKg,
          predictedKg,
          timestamp,
          includePrediction: config.weights.includePrediction,
          metadata: { sessionId },
        });

        for (const entry of payloads) {
          publish(context, entry.metric, Number(entry.value.toFixed(3)), {
            unit: entry.unit,
            sensorId: entry.sensorId,
            timestamp: entry.timestamp,
            metadata: entry.metadata,
          });
        }

        await emitCapture({
          context,
          sessionId,
          weightKg,
          timestamp,
          publishEvent,
        });
      }
    }
  };

  tick();
  setInterval(tick, config.timing.weightIntervalMs);
};

const startSimulation = () => {
  contexts.forEach((context) => {
    if (config.features.environmentSensors) {
      scheduleEnvironment(context);
    }
    if (config.features.waterSensors) {
      scheduleWater(context);
    }
    // Only schedule weights if capture is enabled (for testing purposes)
    if (config.capture.enabled) {
      scheduleWeights(context);
    }
  });

  setInterval(() => {
    contexts.forEach((context) => {
      context.model.advanceDay();
      context.dayIndex = context.model.dayIndex;
      logger.info({ msg: 'Advanced growth day', house: context.houseId, dayIndex: context.dayIndex });
    });
  }, config.timing.dayAdvanceIntervalMs);

  logger.info({ msg: 'Simulation started', contexts: contexts.length });
};

client.on('connect', () => {
  if (!contexts.length) {
    logger.error('No contexts defined; check topology configuration');
    return;
  }
  startSimulation();
});

process.on('SIGINT', () => {
  logger.info('Shutting down mock IoT service');
  client.end(true, () => process.exit(0));
});