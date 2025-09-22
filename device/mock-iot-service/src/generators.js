import { faker } from '@faker-js/faker';
import { config } from './config.js';
import { duckFarmTopology, deviceIdForHouse, stationIdForHouse } from './topology.js';
import { weightScaleMetric, weightPredictionMetric } from './sensorCatalog.js';

const growth = config.growth;

export const makeTopology = () => {
  const entries = [];
  duckFarmTopology.forEach((tenant) => {
    tenant.farms.forEach((farm) => {
      farm.houses.forEach((house) => {
        const cameraId = house.cameraId ?? house.houseId.replace(/^house_/, 'cam_');
        entries.push({
          tenantId: tenant.tenantId,
          tenantName: tenant.tenantName,
          farmId: farm.farmId,
          farmName: farm.farmName,
          houseId: house.houseId,
          houseName: house.houseName,
          deviceId: deviceIdForHouse(house.houseId),
          stationId: stationIdForHouse(house.houseId),
          cameraId,
          flockId: `flock_${house.houseId}_001`,
        });
      });
    });
  });
  return entries;
};

export const randomValue = ({ min, max, variance }) => {
  const base = faker.number.float({ min, max, fractionDigits: 2 });
  if (variance === undefined) {
    return base;
  }
  const delta = faker.number.float({ min: -variance, max: variance, fractionDigits: 2 });
  const value = base + delta;
  return Math.min(max, Math.max(min, Number(value.toFixed(2))));
};

export const makeGrowthModel = () => {
  let dayIndex = 0;
  const noiseRange = 0.05;
  const dailyFeedNoise = 1.0;
  const { startWeightKg, targetWeightKg, growthDays } = growth;

  const advanceDay = () => {
    dayIndex = Math.min(dayIndex + 1, Math.max(growthDays - 1, 1));
  };

  const weightForAnimal = (_animalId) => {
    const t = dayIndex / Math.max(growthDays - 1, 1);
    const linear = startWeightKg + (targetWeightKg - startWeightKg) * t;
    const noise = faker.number.float({ min: -noiseRange, max: noiseRange, fractionDigits: 3 });
    const individual = Math.max(0.1, Number((linear + noise).toFixed(3)));
    return individual;
  };

  const feedIntakeKg = (animalCount) => {
    const base = animalCount * 0.1; // 100g per animal baseline
    const noise = faker.number.float({ min: -dailyFeedNoise, max: dailyFeedNoise, fractionDigits: 2 });
    return Math.max(0.1, Number((base + noise).toFixed(2)));
  };

  return {
    get dayIndex() {
      return dayIndex;
    },
    advanceDay,
    weightForAnimal,
    feedIntakeKg,
  };
};

export const makeWeightPayloads = ({ context, animalId, weightKg, predictedKg, timestamp, includePrediction = false, metadata = {} }) => {
  const baseMetadata = {
    tenantId: context.tenantId,
    tenantName: context.tenantName,
    farmId: context.farmId,
    farmName: context.farmName,
    houseId: context.houseId,
    houseName: context.houseName,
    flockId: context.flockId,
    deviceId: context.deviceId,
    stationId: context.stationId,
    cameraId: context.cameraId,
    dayIndex: context.dayIndex,
    animalId,
    animalCount: config.animalsPerHouse,
    ...metadata,
  };

  const payloads = [
    {
      metric: weightScaleMetric,
      value: weightKg,
      unit: 'kg',
      sensorId: `weight_scale_${animalId}`,
      timestamp,
      metadata: baseMetadata,
    },
  ];

  if (includePrediction) {
    payloads.push({
      metric: weightPredictionMetric,
      value: predictedKg,
      unit: 'kg',
      sensorId: `weight_predict_${animalId}`,
      timestamp: new Date(timestamp.getTime() + 500),
      metadata: baseMetadata,
    });
  }

  return payloads;
};
