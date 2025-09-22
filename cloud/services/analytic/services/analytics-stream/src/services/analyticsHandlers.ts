// src/services/analyticsHandlers.ts
// Handlers for complex analytics data that need direct database writes

import { logger } from '../utils/logger';
import {
  createFcrCalculation,
  createHealthMetrics,
  createProductionMetrics,
  createEnvironmentalMetrics,
  createSizeDistribution,
  createPrediction,
  createAnalyticsJob,
  updateAnalyticsJob,
  type FcrCalculationData,
  type HealthMetricsData,
  type ProductionMetricsData,
  type EnvironmentalMetricsData,
  type SizeDistributionData,
  type PredictionData,
  type AnalyticsJobData
} from '../stores/analyticsRepo';
import { z } from 'zod';

/* ----------------------------- Common parsers ----------------------------- */

const Time = z.preprocess((v) => {
  if (v instanceof Date) return v;
  if (typeof v === 'number') {
    const ms = v > 1e12 ? v : v * 1000;
    return new Date(ms);
  }
  if (typeof v === 'string') {
    const s = v.trim();
    if (/^\d{13}$/.test(s)) return new Date(Number(s));        // epoch ms
    if (/^\d{10}$/.test(s)) return new Date(Number(s) * 1000); // epoch sec
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s)) {
      return new Date(s.replace(' ', 'T') + 'Z');
    }
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return v;
}, z.date());

const Num = z.coerce.number().finite();

const BaseIds = z.object({
  tenant_id: z.string().min(1, 'tenant_id required'),
  farm_id: z.string().optional(),
  house_id: z.string().optional(),
  flock_id: z.string().optional(),
  device_id: z.string().optional(),
});

/* ----------------------------- Event Schemas ----------------------------- */

// FCR
const FcrEvt = BaseIds.extend({
  // require farm/house/flock for FCR records
  farm_id: z.string().min(1),
  house_id: z.string().min(1),
  flock_id: z.string().min(1),
  period_start: Time,
  period_end: Time,
  total_feed: Num,
  total_weight: Num.refine((n) => n !== 0, 'total_weight must be non-zero'),
  fcr_value: Num.optional(),
  population: Num.optional(),
  breed: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Health
const HealthEvt = BaseIds.extend({
  farm_id: z.string().min(1),
  house_id: z.string().min(1),
  flock_id: z.string().min(1),
  measurement_date: Time,
  mortality_rate: Num,
  morbidity_rate: Num,
  avg_weight: Num.optional(),
  feed_intake: Num.optional(),
  water_intake: Num.optional(),
  temperature: Num.optional(),
  humidity: Num.optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Production
const ProductionEvt = BaseIds.extend({
  farm_id: z.string().min(1),
  house_id: z.string().min(1),
  flock_id: z.string().min(1),
  period_start: Time,
  period_end: Time,
  total_production: Num,
  daily_production: Num,
  production_rate: Num,
  quality_score: Num.optional(),
  efficiency: Num.optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Environmental
const EnvEvt = BaseIds.extend({
  farm_id: z.string().min(1),
  house_id: z.string().min(1),
  measurement_date: Time,
  temperature: Num.optional(),
  humidity: Num.optional(),
  co2_level: Num.optional(),
  nh3_level: Num.optional(),
  light_level: Num.optional(),
  air_velocity: Num.optional(),
  pressure: Num.optional(),
  metadata: z.record(z.unknown()).optional(),
}).extend({
  device_id: z.string().min(1, 'device_id required'),
});

// Size distribution
const SizeEvt = BaseIds.extend({
  farm_id: z.string().min(1),
  house_id: z.string().min(1),
  flock_id: z.string().min(1),
  measurement_date: Time,
  weight_class: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE']),
  min_weight: Num,
  max_weight: Num,
  count: Num,
  percentage: Num.optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Prediction
const PredEvt = BaseIds.extend({
  farm_id: z.string().min(1),
  model_id: z.string().min(1),
  prediction_type: z.enum(['FCR','WEIGHT','HEALTH','PRODUCTION','MORTALITY','FEED_INTAKE','WATER_INTAKE']),
  target_date: Time,
  predicted_value: Num,
  confidence: Num.optional(),
  actual_value: Num.optional(),
  accuracy: Num.optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Analytics Job
const JobEvt = z.object({
  tenant_id: z.string().min(1),
  job_type: z.enum(['FCR_CALCULATION','PREDICTION','ANOMALY_DETECTION','SIZE_DISTRIBUTION','HEALTH_ANALYSIS','PRODUCTION_ANALYSIS','ENVIRONMENTAL_ANALYSIS']),
  status: z.enum(['PENDING','RUNNING','COMPLETED','FAILED','CANCELLED']).optional(),
  priority: z.union([z.string(), Num]).optional(),
  config: z.record(z.unknown()).optional(),
  result: z.record(z.unknown()).optional(),
  error_message: z.string().optional(),
  started_at: Time.optional(),
  completed_at: Time.optional(),
});

/* ----------------------------- Handlers ----------------------------- */

// ===========================================
// FCR Calculation Handler
// ===========================================
export async function handleFcrCalculationEvent(data: any) {
  try {
    const d = FcrEvt.parse(data);
    logger.info({ data: d }, 'Processing FCR calculation event');

    const totalFeed = d.total_feed;
    const totalWeight = d.total_weight;
    const fcrValue = d.fcr_value ?? (totalFeed / totalWeight);

    const fcrData: FcrCalculationData = {
      tenantId: d.tenant_id,
      farmId: d.farm_id,
      houseId: d.house_id,
      flockId: d.flock_id,
      periodStart: d.period_start,
      periodEnd: d.period_end,
      totalFeed: totalFeed,
      totalWeight: totalWeight,
      fcrValue: fcrValue,
      population: d.population ?? undefined,
      breed: d.breed ?? undefined,
      metadata: d.metadata || {}
    };

    const result = await createFcrCalculation(fcrData);
    logger.info({ fcrId: result.id }, 'FCR calculation created successfully');
    return result;
  } catch (error) {
    logger.error({ error, data }, 'Failed to handle FCR calculation event');
    throw error;
  }
}

// ===========================================
// Health Metrics Handler
// ===========================================
export async function handleHealthMetricsEvent(data: any) {
  try {
    const d = HealthEvt.parse(data);
    logger.info({ data: d }, 'Processing health metrics event');

    const healthData: HealthMetricsData = {
      tenantId: d.tenant_id,
      farmId: d.farm_id,
      houseId: d.house_id,
      flockId: d.flock_id,
      measurementDate: d.measurement_date,
      mortalityRate: d.mortality_rate ?? undefined,
      morbidityRate: d.morbidity_rate ?? undefined,
      avgWeight: d.avg_weight ?? undefined,
      feedIntake: d.feed_intake ?? undefined,
      waterIntake: d.water_intake ?? undefined,
      temperature: d.temperature ?? undefined,
      humidity: d.humidity ?? undefined,
      metadata: d.metadata || {}
    };

    const result = await createHealthMetrics(healthData);
    logger.info({ healthId: result.id }, 'Health metrics created successfully');
    return result;
  } catch (error) {
    logger.error({ error, data }, 'Failed to handle health metrics event');
    throw error;
  }
}

// ===========================================
// Production Metrics Handler
// ===========================================
export async function handleProductionMetricsEvent(data: any) {
  try {
    const d = ProductionEvt.parse(data);
    logger.info({ data: d }, 'Processing production metrics event');

    const productionData: ProductionMetricsData = {
      tenantId: d.tenant_id,
      farmId: d.farm_id,
      houseId: d.house_id,
      flockId: d.flock_id ?? undefined,
      periodStart: d.period_start,
      periodEnd: d.period_end,
      totalProduction: d.total_production ?? undefined,
      dailyProduction: d.daily_production ?? undefined,
      productionRate: d.production_rate ?? undefined,
      qualityScore: d.quality_score ?? undefined,
      efficiency: d.efficiency ?? undefined,
      metadata: d.metadata || {}
    };

    const result = await createProductionMetrics(productionData);
    logger.info({ productionId: result.id }, 'Production metrics created successfully');
    return result;
  } catch (error) {
    logger.error({ error, data }, 'Failed to handle production metrics event');
    throw error;
  }
}

// ===========================================
// Environmental Metrics Handler
// ===========================================
export async function handleEnvironmentalMetricsEvent(data: any) {
  try {
    const d = EnvEvt.parse(data);
    logger.info({ data: d }, 'Processing environmental metrics event');

    const envData: EnvironmentalMetricsData = {
      tenantId: d.tenant_id,
      farmId: d.farm_id,
      houseId: d.house_id,
      deviceId: d.device_id,
      measurementDate: d.measurement_date,
      temperature: d.temperature ?? undefined,
      humidity: d.humidity ?? undefined,
      co2Level: d.co2_level ?? undefined,
      nh3Level: d.nh3_level ?? undefined,
      lightLevel: d.light_level ?? undefined,
      airVelocity: d.air_velocity ?? undefined,
      pressure: d.pressure ?? undefined,
      metadata: d.metadata || {}
    };

    const result = await createEnvironmentalMetrics(envData);
    logger.info({ envId: result.id }, 'Environmental metrics created successfully');
    return result;
  } catch (error) {
    logger.error({ error, data }, 'Failed to handle environmental metrics event');
    throw error;
  }
}

// ===========================================
// Size Distribution Handler
// ===========================================
export async function handleSizeDistributionEvent(data: any) {
  try {
    const d = SizeEvt.parse(data);
    logger.info({ data: d }, 'Processing size distribution event');

    const sizeData: SizeDistributionData = {
      tenantId: d.tenant_id,
      farmId: d.farm_id,
      houseId: d.house_id ?? undefined,
      flockId: d.flock_id ?? undefined,
      measurementDate: d.measurement_date,
      weightClass: d.weight_class,
      minWeight: d.min_weight,
      maxWeight: d.max_weight,
      count: d.count,
      percentage: d.percentage ?? undefined,
      metadata: d.metadata || {}
    };

    const result = await createSizeDistribution(sizeData);
    logger.info({ sizeId: result.id }, 'Size distribution created successfully');
    return result;
  } catch (error) {
    logger.error({ error, data }, 'Failed to handle size distribution event');
    throw error;
  }
}

// ===========================================
// Prediction Handler
// ===========================================
export async function handlePredictionEvent(data: any) {
  try {
    const d = PredEvt.parse(data);
    logger.info({ data: d }, 'Processing prediction event');

    const predictionData: PredictionData = {
      tenantId: d.tenant_id,
      modelId: d.model_id,
      farmId: d.farm_id ?? undefined,
      houseId: d.house_id ?? undefined,
      flockId: d.flock_id ?? undefined,
      deviceId: d.device_id ?? undefined,
      predictionType: d.prediction_type as any,
      targetDate: d.target_date,
      predictedValue: d.predicted_value,
      confidence: d.confidence ?? undefined,
      actualValue: d.actual_value ?? undefined,
      accuracy: d.accuracy ?? undefined,
      metadata: d.metadata || {}
    };

    const result = await createPrediction(predictionData);
    logger.info({ predictionId: result.id }, 'Prediction created successfully');
    return result;
  } catch (error) {
    logger.error({ error, data }, 'Failed to handle prediction event');
    throw error;
  }
}

// ===========================================
// Analytics Job Handler
// ===========================================
export async function handleAnalyticsJobEvent(data: any) {
  try {
    const d = JobEvt.parse(data);
    logger.info({ data: d }, 'Processing analytics job event');

    const jobData: AnalyticsJobData = {
      tenantId: d.tenant_id,
      jobType: d.job_type as any,
      status: d.status as any,
      priority: typeof d.priority === 'number' ? d.priority : (d.priority ? Number(d.priority) : undefined),
      config: d.config || {},
      result: d.result || {},
      errorMessage: d.error_message,
      startedAt: d.started_at,
      completedAt: d.completed_at
    };

    const result = await createAnalyticsJob(jobData);
    logger.info({ jobId: result.id }, 'Analytics job created successfully');
    return result;
  } catch (error) {
    logger.error({ error, data }, 'Failed to handle analytics job event');
    throw error;
  }
}

/* ----------------------------- Batch Processing ----------------------------- */

export async function handleBatchFcrCalculations(calculations: any[]) {
  const results: any[] = [];
  const errors: Array<{ data: any; error: string }> = [];

  for (const calc of calculations) {
    try {
      const result = await handleFcrCalculationEvent(calc);
      results.push(result);
    } catch (error) {
      errors.push({ data: calc, error: error instanceof Error ? error.message : String(error) });
    }
  }

  logger.info({ processed: calculations.length, successful: results.length, failed: errors.length }, 'Batch FCR calculations processed');
  return { results, errors };
}

export async function handleBatchHealthMetrics(metrics: any[]) {
  const results: any[] = [];
  const errors: Array<{ data: any; error: string }> = [];

  for (const metric of metrics) {
    try {
      const result = await handleHealthMetricsEvent(metric);
      results.push(result);
    } catch (error) {
      errors.push({ data: metric, error: error instanceof Error ? error.message : String(error) });
    }
  }

  logger.info({ processed: metrics.length, successful: results.length, failed: errors.length }, 'Batch health metrics processed');
  return { results, errors };
}

/* ----------------------------- Utilities ----------------------------- */

export function validateAnalyticsData(data: any, requiredFields: string[]): boolean {
  for (const field of requiredFields) {
    if (data[field] === null || data[field] === undefined || data[field] === '') {
      logger.warn({ data, missingField: field }, 'Missing required field in analytics data');
      return false;
    }
  }
  return true;
}

export function sanitizeAnalyticsData(data: any): any {
  // Remove null/undefined values and sanitize strings (shallow)
  const sanitized: Record<string, any> = {};
  Object.entries(data ?? {}).forEach(([k, v]) => {
    if (v === null || v === undefined) return;
    sanitized[k] = typeof v === 'string' ? v.trim() : v;
  });
  return sanitized;
}
