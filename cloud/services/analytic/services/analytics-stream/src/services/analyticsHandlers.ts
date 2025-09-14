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

// ===========================================
// FCR Calculation Handler
// ===========================================

export async function handleFcrCalculationEvent(data: any) {
  try {
    logger.info({ data }, 'Processing FCR calculation event');
    
    const fcrData: FcrCalculationData = {
      tenantId: data.tenant_id,
      farmId: data.farm_id,
      houseId: data.house_id,
      flockId: data.flock_id,
      periodStart: new Date(data.period_start),
      periodEnd: new Date(data.period_end),
      totalFeed: data.total_feed,
      totalWeight: data.total_weight,
      fcrValue: data.fcr_value,
      population: data.population,
      breed: data.breed,
      metadata: data.metadata || {}
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
    logger.info({ data }, 'Processing health metrics event');
    
    const healthData: HealthMetricsData = {
      tenantId: data.tenant_id,
      farmId: data.farm_id,
      houseId: data.house_id,
      flockId: data.flock_id,
      measurementDate: new Date(data.measurement_date),
      mortalityRate: data.mortality_rate,
      morbidityRate: data.morbidity_rate,
      avgWeight: data.avg_weight,
      feedIntake: data.feed_intake,
      waterIntake: data.water_intake,
      temperature: data.temperature,
      humidity: data.humidity,
      metadata: data.metadata || {}
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
    logger.info({ data }, 'Processing production metrics event');
    
    const productionData: ProductionMetricsData = {
      tenantId: data.tenant_id,
      farmId: data.farm_id,
      houseId: data.house_id,
      flockId: data.flock_id,
      periodStart: new Date(data.period_start),
      periodEnd: new Date(data.period_end),
      totalProduction: data.total_production,
      dailyProduction: data.daily_production,
      productionRate: data.production_rate,
      qualityScore: data.quality_score,
      efficiency: data.efficiency,
      metadata: data.metadata || {}
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
    logger.info({ data }, 'Processing environmental metrics event');
    
    const envData: EnvironmentalMetricsData = {
      tenantId: data.tenant_id,
      farmId: data.farm_id,
      houseId: data.house_id,
      deviceId: data.device_id,
      measurementDate: new Date(data.measurement_date),
      temperature: data.temperature,
      humidity: data.humidity,
      co2Level: data.co2_level,
      nh3Level: data.nh3_level,
      lightLevel: data.light_level,
      airVelocity: data.air_velocity,
      pressure: data.pressure,
      metadata: data.metadata || {}
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
    logger.info({ data }, 'Processing size distribution event');
    
    const sizeData: SizeDistributionData = {
      tenantId: data.tenant_id,
      farmId: data.farm_id,
      houseId: data.house_id,
      flockId: data.flock_id,
      measurementDate: new Date(data.measurement_date),
      weightClass: data.weight_class,
      minWeight: data.min_weight,
      maxWeight: data.max_weight,
      count: data.count,
      percentage: data.percentage,
      metadata: data.metadata || {}
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
    logger.info({ data }, 'Processing prediction event');
    
    const predictionData: PredictionData = {
      tenantId: data.tenant_id,
      modelId: data.model_id,
      farmId: data.farm_id,
      houseId: data.house_id,
      flockId: data.flock_id,
      deviceId: data.device_id,
      predictionType: data.prediction_type,
      targetDate: new Date(data.target_date),
      predictedValue: data.predicted_value,
      confidence: data.confidence,
      actualValue: data.actual_value,
      accuracy: data.accuracy,
      metadata: data.metadata || {}
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
    logger.info({ data }, 'Processing analytics job event');
    
    const jobData: AnalyticsJobData = {
      tenantId: data.tenant_id,
      jobType: data.job_type,
      status: data.status,
      priority: data.priority,
      config: data.config || {},
      result: data.result || {},
      errorMessage: data.error_message,
      startedAt: data.started_at ? new Date(data.started_at) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined
    };

    const result = await createAnalyticsJob(jobData);
    logger.info({ jobId: result.id }, 'Analytics job created successfully');
    
    return result;
  } catch (error) {
    logger.error({ error, data }, 'Failed to handle analytics job event');
    throw error;
  }
}

// ===========================================
// Batch Processing Handlers
// ===========================================

export async function handleBatchFcrCalculations(calculations: any[]) {
  const results = [];
  const errors = [];

  for (const calc of calculations) {
    try {
      const result = await handleFcrCalculationEvent(calc);
      results.push(result);
    } catch (error) {
      errors.push({ data: calc, error: error instanceof Error ? error.message : String(error) });
    }
  }

  logger.info({ 
    processed: calculations.length, 
    successful: results.length, 
    failed: errors.length 
  }, 'Batch FCR calculations processed');

  return { results, errors };
}

export async function handleBatchHealthMetrics(metrics: any[]) {
  const results = [];
  const errors = [];

  for (const metric of metrics) {
    try {
      const result = await handleHealthMetricsEvent(metric);
      results.push(result);
    } catch (error) {
      errors.push({ data: metric, error: error instanceof Error ? error.message : String(error) });
    }
  }

  logger.info({ 
    processed: metrics.length, 
    successful: results.length, 
    failed: errors.length 
  }, 'Batch health metrics processed');

  return { results, errors };
}

// ===========================================
// Utility Functions
// ===========================================

export function validateAnalyticsData(data: any, requiredFields: string[]): boolean {
  for (const field of requiredFields) {
    if (!data[field]) {
      logger.warn({ data, missingField: field }, 'Missing required field in analytics data');
      return false;
    }
  }
  return true;
}

export function sanitizeAnalyticsData(data: any): any {
  // Remove null/undefined values and sanitize strings
  const sanitized = { ...data };
  
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === null || sanitized[key] === undefined) {
      delete sanitized[key];
    } else if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitized[key].trim();
    }
  });
  
  return sanitized;
}
