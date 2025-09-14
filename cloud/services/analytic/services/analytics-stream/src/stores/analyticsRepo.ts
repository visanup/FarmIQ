// src/stores/analyticsRepo.ts
// Repository functions for all analytics tables

import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';

// ===========================================
// FCR (Feed Conversion Ratio) Repository
// ===========================================

export interface FcrCalculationData {
  tenantId: string;
  farmId: string;
  houseId: string;
  flockId: string;
  periodStart: Date;
  periodEnd: Date;
  totalFeed: number;
  totalWeight: number;
  fcrValue: number;
  population?: number;
  breed?: string;
  metadata?: any;
}

export async function createFcrCalculation(data: FcrCalculationData) {
  try {
    return await prisma.fcrCalculation.create({
      data: {
        tenantId: data.tenantId,
        farmId: data.farmId,
        houseId: data.houseId,
        flockId: data.flockId,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        totalFeed: data.totalFeed,
        totalWeight: data.totalWeight,
        fcrValue: data.fcrValue,
        population: data.population,
        breed: data.breed,
        metadata: data.metadata || {}
      }
    });
  } catch (error) {
    logger.error({ error, data }, 'Failed to create FCR calculation');
    throw error;
  }
}

export interface FcrTargetData {
  tenantId: string;
  farmId: string;
  houseId?: string;
  breed?: string;
  targetFcr: number;
  minFcr?: number;
  maxFcr?: number;
  isActive?: boolean;
  metadata?: any;
}

export async function upsertFcrTarget(data: FcrTargetData) {
  try {
    // Use a composite approach since Prisma doesn't have the exact unique constraint
    const existing = await prisma.fcrTarget.findFirst({
      where: {
        tenantId: data.tenantId,
        farmId: data.farmId,
        houseId: data.houseId || null
      }
    });

    if (existing) {
      return await prisma.fcrTarget.update({
        where: { id: existing.id },
        data: {
          breed: data.breed,
          targetFcr: data.targetFcr,
          minFcr: data.minFcr,
          maxFcr: data.maxFcr,
          isActive: data.isActive ?? true,
          metadata: data.metadata || {}
        }
      });
    }

    return await prisma.fcrTarget.create({
      data: {
        tenantId: data.tenantId,
        farmId: data.farmId,
        houseId: data.houseId,
        breed: data.breed,
        targetFcr: data.targetFcr,
        minFcr: data.minFcr,
        maxFcr: data.maxFcr,
        isActive: data.isActive ?? true,
        metadata: data.metadata || {}
      }
    });
  } catch (error) {
    logger.error({ error, data }, 'Failed to upsert FCR target');
    throw error;
  }
}

// ===========================================
// Health Metrics Repository
// ===========================================

export interface HealthMetricsData {
  tenantId: string;
  farmId: string;
  houseId: string;
  flockId: string;
  measurementDate: Date;
  mortalityRate: number;
  morbidityRate: number;
  avgWeight?: number;
  feedIntake?: number;
  waterIntake?: number;
  temperature?: number;
  humidity?: number;
  metadata?: any;
}

export async function createHealthMetrics(data: HealthMetricsData) {
  try {
    return await prisma.healthMetrics.create({
      data: {
        tenantId: data.tenantId,
        farmId: data.farmId,
        houseId: data.houseId,
        flockId: data.flockId,
        measurementDate: data.measurementDate,
        mortalityRate: data.mortalityRate,
        morbidityRate: data.morbidityRate,
        avgWeight: data.avgWeight,
        feedIntake: data.feedIntake,
        waterIntake: data.waterIntake,
        temperature: data.temperature,
        humidity: data.humidity,
        metadata: data.metadata || {}
      }
    });
  } catch (error) {
    logger.error({ error, data }, 'Failed to create health metrics');
    throw error;
  }
}

// ===========================================
// Production Metrics Repository
// ===========================================

export interface ProductionMetricsData {
  tenantId: string;
  farmId: string;
  houseId: string;
  flockId: string;
  periodStart: Date;
  periodEnd: Date;
  totalProduction: number;
  dailyProduction: number;
  productionRate: number;
  qualityScore?: number;
  efficiency?: number;
  metadata?: any;
}

export async function createProductionMetrics(data: ProductionMetricsData) {
  try {
    return await prisma.productionMetrics.create({
      data: {
        tenantId: data.tenantId,
        farmId: data.farmId,
        houseId: data.houseId,
        flockId: data.flockId,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        totalProduction: data.totalProduction,
        dailyProduction: data.dailyProduction,
        productionRate: data.productionRate,
        qualityScore: data.qualityScore,
        efficiency: data.efficiency,
        metadata: data.metadata || {}
      }
    });
  } catch (error) {
    logger.error({ error, data }, 'Failed to create production metrics');
    throw error;
  }
}

// ===========================================
// Environmental Metrics Repository
// ===========================================

export interface EnvironmentalMetricsData {
  tenantId: string;
  farmId: string;
  houseId: string;
  deviceId: string;
  measurementDate: Date;
  temperature?: number;
  humidity?: number;
  co2Level?: number;
  nh3Level?: number;
  lightLevel?: number;
  airVelocity?: number;
  pressure?: number;
  metadata?: any;
}

export async function createEnvironmentalMetrics(data: EnvironmentalMetricsData) {
  try {
    return await prisma.environmentalMetrics.create({
      data: {
        tenantId: data.tenantId,
        farmId: data.farmId,
        houseId: data.houseId,
        deviceId: data.deviceId,
        measurementDate: data.measurementDate,
        temperature: data.temperature,
        humidity: data.humidity,
        co2Level: data.co2Level,
        nh3Level: data.nh3Level,
        lightLevel: data.lightLevel,
        airVelocity: data.airVelocity,
        pressure: data.pressure,
        metadata: data.metadata || {}
      }
    });
  } catch (error) {
    logger.error({ error, data }, 'Failed to create environmental metrics');
    throw error;
  }
}

// ===========================================
// Size Distribution Repository
// ===========================================

export interface SizeDistributionData {
  tenantId: string;
  farmId: string;
  houseId: string;
  flockId: string;
  measurementDate: Date;
  weightClass: 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE';
  minWeight: number;
  maxWeight: number;
  count: number;
  percentage?: number;
  metadata?: any;
}

export async function createSizeDistribution(data: SizeDistributionData) {
  try {
    return await prisma.sizeDistribution.create({
      data: {
        tenantId: data.tenantId,
        farmId: data.farmId,
        houseId: data.houseId,
        flockId: data.flockId,
        measurementDate: data.measurementDate,
        weightClass: data.weightClass,
        minWeight: data.minWeight,
        maxWeight: data.maxWeight,
        count: data.count,
        percentage: data.percentage,
        metadata: data.metadata || {}
      }
    });
  } catch (error) {
    logger.error({ error, data }, 'Failed to create size distribution');
    throw error;
  }
}

// ===========================================
// Prediction Models Repository
// ===========================================

export interface PredictionModelData {
  tenantId: string;
  modelName: string;
  modelType: 'FCR' | 'WEIGHT' | 'HEALTH' | 'PRODUCTION' | 'MORTALITY' | 'FEED_INTAKE' | 'WATER_INTAKE';
  version?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'TRAINING' | 'ERROR' | 'DEPRECATED';
  config?: any;
  metrics?: any;
  isActive?: boolean;
}

export async function createPredictionModel(data: PredictionModelData) {
  try {
    return await prisma.predictionModel.create({
      data: {
        tenantId: data.tenantId,
        modelName: data.modelName,
        modelType: data.modelType,
        version: data.version || '1.0.0',
        status: data.status || 'ACTIVE',
        config: data.config || {},
        metrics: data.metrics || {},
        isActive: data.isActive ?? true
      }
    });
  } catch (error) {
    logger.error({ error, data }, 'Failed to create prediction model');
    throw error;
  }
}

export interface PredictionData {
  tenantId: string;
  modelId: string;
  farmId: string;
  houseId?: string;
  flockId?: string;
  deviceId?: string;
  predictionType: 'FCR' | 'WEIGHT' | 'HEALTH' | 'PRODUCTION' | 'MORTALITY' | 'FEED_INTAKE' | 'WATER_INTAKE';
  targetDate: Date;
  predictedValue: number;
  confidence?: number;
  actualValue?: number;
  accuracy?: number;
  metadata?: any;
}

export async function createPrediction(data: PredictionData) {
  try {
    return await prisma.prediction.create({
      data: {
        tenantId: data.tenantId,
        modelId: data.modelId,
        farmId: data.farmId,
        houseId: data.houseId,
        flockId: data.flockId,
        deviceId: data.deviceId,
        predictionType: data.predictionType,
        targetDate: data.targetDate,
        predictedValue: data.predictedValue,
        confidence: data.confidence,
        actualValue: data.actualValue,
        accuracy: data.accuracy,
        metadata: data.metadata || {}
      }
    });
  } catch (error) {
    logger.error({ error, data }, 'Failed to create prediction');
    throw error;
  }
}

// ===========================================
// Analytics Configuration Repository
// ===========================================

export interface AnalyticsConfigData {
  tenantId: string;
  configType: 'FCR' | 'PREDICTION' | 'ALERT' | 'KPI' | 'THRESHOLD' | 'NOTIFICATION';
  configKey: string;
  configValue: any;
  isActive?: boolean;
  metadata?: any;
}

export async function upsertAnalyticsConfig(data: AnalyticsConfigData) {
  try {
    // Use a composite approach since Prisma doesn't have the exact unique constraint
    const existing = await prisma.analyticsConfig.findFirst({
      where: {
        tenantId: data.tenantId,
        configType: data.configType,
        configKey: data.configKey
      }
    });

    if (existing) {
      return await prisma.analyticsConfig.update({
        where: { id: existing.id },
        data: {
          configValue: data.configValue,
          isActive: data.isActive ?? true,
          metadata: data.metadata || {}
        }
      });
    }

    return await prisma.analyticsConfig.create({
      data: {
        tenantId: data.tenantId,
        configType: data.configType,
        configKey: data.configKey,
        configValue: data.configValue,
        isActive: data.isActive ?? true,
        metadata: data.metadata || {}
      }
    });
  } catch (error) {
    logger.error({ error, data }, 'Failed to upsert analytics config');
    throw error;
  }
}

// ===========================================
// Analytics Job Repository
// ===========================================

export interface AnalyticsJobData {
  tenantId: string;
  jobType: 'FCR_CALCULATION' | 'PREDICTION' | 'ANOMALY_DETECTION' | 'SIZE_DISTRIBUTION' | 'HEALTH_ANALYSIS' | 'PRODUCTION_ANALYSIS' | 'ENVIRONMENTAL_ANALYSIS';
  status?: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  priority?: number;
  config?: any;
  result?: any;
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export async function createAnalyticsJob(data: AnalyticsJobData) {
  try {
    return await prisma.analyticsJob.create({
      data: {
        tenantId: data.tenantId,
        jobType: data.jobType,
        status: data.status || 'PENDING',
        priority: data.priority || 0,
        config: data.config || {},
        result: data.result || {},
        errorMessage: data.errorMessage,
        startedAt: data.startedAt,
        completedAt: data.completedAt
      }
    });
  } catch (error) {
    logger.error({ error, data }, 'Failed to create analytics job');
    throw error;
  }
}

export async function updateAnalyticsJob(id: string, updates: Partial<AnalyticsJobData>) {
  try {
    return await prisma.analyticsJob.update({
      where: { id },
      data: updates
    });
  } catch (error) {
    logger.error({ error, id, updates }, 'Failed to update analytics job');
    throw error;
  }
}
