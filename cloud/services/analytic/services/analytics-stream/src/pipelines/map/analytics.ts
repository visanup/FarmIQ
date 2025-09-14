// src/pipelines/map/analytics.ts
// Handlers for analytics-specific Kafka topics

import { z } from 'zod';
import { Measurement } from '../../types/measurement';

const Time = z.preprocess((input) => {
  if (input instanceof Date) return input;
  if (typeof input === 'string') return new Date(input);
  if (typeof input === 'number') return new Date(input);
  return input;
}, z.date());

const sanitize = (x: string) =>
  x.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '_');

/* ------------------------------------------------------------------------------------------------
 * 1) FCR CALCULATION (topic: analytics.fcr.calculation.v1)
 * ----------------------------------------------------------------------------------------------*/

const FcrCalculationSchema = z.object({
  schema: z.string().optional(),
  tenant_id: z.string().min(1),
  farm_id: z.string().min(1),
  house_id: z.string().min(1),
  flock_id: z.string().min(1),
  
  period_start: Time,
  period_end: Time,
  total_feed: z.number().finite(),
  total_weight: z.number().finite(),
  fcr_value: z.number().finite(),
  population: z.number().int().optional(),
  breed: z.string().optional(),
  
  time: Time.optional(),
  ts: Time.optional(),
  meta: z.record(z.unknown()).optional()
}).refine(d => !!(d.time ?? d.ts), { path: ['time'], message: 'Required' });

export function toMeasurementsFromFcrCalculation(o: any): Measurement[] | null {
  const d = FcrCalculationSchema.parse(o);
  const time = d.time ?? d.ts!;
  
  const baseProps = {
    tenant_id: d.tenant_id,
    device_id: d.house_id, // Use house_id as device_id for FCR metrics
    time,
    tags: {
      farm_id: d.farm_id,
      house_id: d.house_id,
      flock_id: d.flock_id,
      ...(d.breed && { breed: d.breed }),
      ...d.meta
    }
  };

  return [
    { ...baseProps, metric: 'fcr.total_feed', value: d.total_feed, tags: { ...baseProps.tags, unit: 'kg' } },
    { ...baseProps, metric: 'fcr.total_weight', value: d.total_weight, tags: { ...baseProps.tags, unit: 'kg' } },
    { ...baseProps, metric: 'fcr.value', value: d.fcr_value, tags: { ...baseProps.tags, unit: 'ratio' } },
    ...(d.population ? [{ ...baseProps, metric: 'fcr.population', value: d.population, tags: { ...baseProps.tags, unit: 'count' } }] : [])
  ];
}

/* ------------------------------------------------------------------------------------------------
 * 2) HEALTH METRICS (topic: analytics.health.metrics.v1)
 * ----------------------------------------------------------------------------------------------*/

const HealthMetricsSchema = z.object({
  schema: z.string().optional(),
  tenant_id: z.string().min(1),
  farm_id: z.string().min(1),
  house_id: z.string().min(1),
  flock_id: z.string().min(1),
  
  measurement_date: Time,
  mortality_rate: z.number().finite(),
  morbidity_rate: z.number().finite(),
  avg_weight: z.number().finite().optional(),
  feed_intake: z.number().finite().optional(),
  water_intake: z.number().finite().optional(),
  temperature: z.number().finite().optional(),
  humidity: z.number().finite().optional(),
  
  time: Time.optional(),
  ts: Time.optional(),
  meta: z.record(z.unknown()).optional()
}).refine(d => !!(d.time ?? d.ts), { path: ['time'], message: 'Required' });

export function toMeasurementsFromHealthMetrics(o: any): Measurement[] | null {
  const d = HealthMetricsSchema.parse(o);
  const time = d.time ?? d.ts!;
  
  const baseProps = {
    tenant_id: d.tenant_id,
    device_id: d.house_id,
    time,
    tags: {
      farm_id: d.farm_id,
      house_id: d.house_id,
      flock_id: d.flock_id,
      ...d.meta
    }
  };

  const measurements: Measurement[] = [
    { ...baseProps, metric: 'health.mortality_rate', value: d.mortality_rate, tags: { ...baseProps.tags, unit: 'per_1000' } },
    { ...baseProps, metric: 'health.morbidity_rate', value: d.morbidity_rate, tags: { ...baseProps.tags, unit: 'per_1000' } }
  ];

  // Add optional measurements
  if (d.avg_weight !== undefined) {
    measurements.push({ ...baseProps, metric: 'health.avg_weight', value: d.avg_weight, tags: { ...baseProps.tags, unit: 'kg' } });
  }
  if (d.feed_intake !== undefined) {
    measurements.push({ ...baseProps, metric: 'health.feed_intake', value: d.feed_intake, tags: { ...baseProps.tags, unit: 'kg_per_day' } });
  }
  if (d.water_intake !== undefined) {
    measurements.push({ ...baseProps, metric: 'health.water_intake', value: d.water_intake, tags: { ...baseProps.tags, unit: 'l_per_day' } });
  }
  if (d.temperature !== undefined) {
    measurements.push({ ...baseProps, metric: 'health.temperature', value: d.temperature, tags: { ...baseProps.tags, unit: 'celsius' } });
  }
  if (d.humidity !== undefined) {
    measurements.push({ ...baseProps, metric: 'health.humidity', value: d.humidity, tags: { ...baseProps.tags, unit: 'percent' } });
  }

  return measurements;
}

/* ------------------------------------------------------------------------------------------------
 * 3) PRODUCTION METRICS (topic: analytics.production.metrics.v1)
 * ----------------------------------------------------------------------------------------------*/

const ProductionMetricsSchema = z.object({
  schema: z.string().optional(),
  tenant_id: z.string().min(1),
  farm_id: z.string().min(1),
  house_id: z.string().min(1),
  flock_id: z.string().min(1),
  
  period_start: Time,
  period_end: Time,
  total_production: z.number().finite(),
  daily_production: z.number().finite(),
  production_rate: z.number().finite(),
  quality_score: z.number().finite().optional(),
  efficiency: z.number().finite().optional(),
  
  time: Time.optional(),
  ts: Time.optional(),
  meta: z.record(z.unknown()).optional()
}).refine(d => !!(d.time ?? d.ts), { path: ['time'], message: 'Required' });

export function toMeasurementsFromProductionMetrics(o: any): Measurement[] | null {
  const d = ProductionMetricsSchema.parse(o);
  const time = d.time ?? d.ts!;
  
  const baseProps = {
    tenant_id: d.tenant_id,
    device_id: d.house_id,
    time,
    tags: {
      farm_id: d.farm_id,
      house_id: d.house_id,
      flock_id: d.flock_id,
      ...d.meta
    }
  };

  const measurements: Measurement[] = [
    { ...baseProps, metric: 'production.total', value: d.total_production, tags: { ...baseProps.tags, unit: 'units' } },
    { ...baseProps, metric: 'production.daily', value: d.daily_production, tags: { ...baseProps.tags, unit: 'units_per_day' } },
    { ...baseProps, metric: 'production.rate', value: d.production_rate, tags: { ...baseProps.tags, unit: 'units_per_animal' } }
  ];

  if (d.quality_score !== undefined) {
    measurements.push({ ...baseProps, metric: 'production.quality_score', value: d.quality_score, tags: { ...baseProps.tags, unit: 'score' } });
  }
  if (d.efficiency !== undefined) {
    measurements.push({ ...baseProps, metric: 'production.efficiency', value: d.efficiency, tags: { ...baseProps.tags, unit: 'percent' } });
  }

  return measurements;
}

/* ------------------------------------------------------------------------------------------------
 * 4) ENVIRONMENTAL METRICS (topic: analytics.environmental.metrics.v1)
 * ----------------------------------------------------------------------------------------------*/

const EnvironmentalMetricsSchema = z.object({
  schema: z.string().optional(),
  tenant_id: z.string().min(1),
  farm_id: z.string().min(1),
  house_id: z.string().min(1),
  device_id: z.string().min(1),
  
  measurement_date: Time,
  temperature: z.number().finite().optional(),
  humidity: z.number().finite().optional(),
  co2_level: z.number().finite().optional(),
  nh3_level: z.number().finite().optional(),
  light_level: z.number().finite().optional(),
  air_velocity: z.number().finite().optional(),
  pressure: z.number().finite().optional(),
  
  time: Time.optional(),
  ts: Time.optional(),
  meta: z.record(z.unknown()).optional()
}).refine(d => !!(d.time ?? d.ts), { path: ['time'], message: 'Required' });

export function toMeasurementsFromEnvironmentalMetrics(o: any): Measurement[] | null {
  const d = EnvironmentalMetricsSchema.parse(o);
  const time = d.time ?? d.ts!;
  
  const baseProps = {
    tenant_id: d.tenant_id,
    device_id: d.device_id,
    time,
    tags: {
      farm_id: d.farm_id,
      house_id: d.house_id,
      ...d.meta
    }
  };

  const measurements: Measurement[] = [];

  if (d.temperature !== undefined) {
    measurements.push({ ...baseProps, metric: 'env.temperature', value: d.temperature, tags: { ...baseProps.tags, unit: 'celsius' } });
  }
  if (d.humidity !== undefined) {
    measurements.push({ ...baseProps, metric: 'env.humidity', value: d.humidity, tags: { ...baseProps.tags, unit: 'percent' } });
  }
  if (d.co2_level !== undefined) {
    measurements.push({ ...baseProps, metric: 'env.co2_level', value: d.co2_level, tags: { ...baseProps.tags, unit: 'ppm' } });
  }
  if (d.nh3_level !== undefined) {
    measurements.push({ ...baseProps, metric: 'env.nh3_level', value: d.nh3_level, tags: { ...baseProps.tags, unit: 'ppm' } });
  }
  if (d.light_level !== undefined) {
    measurements.push({ ...baseProps, metric: 'env.light_level', value: d.light_level, tags: { ...baseProps.tags, unit: 'lux' } });
  }
  if (d.air_velocity !== undefined) {
    measurements.push({ ...baseProps, metric: 'env.air_velocity', value: d.air_velocity, tags: { ...baseProps.tags, unit: 'm_per_s' } });
  }
  if (d.pressure !== undefined) {
    measurements.push({ ...baseProps, metric: 'env.pressure', value: d.pressure, tags: { ...baseProps.tags, unit: 'pa' } });
  }

  return measurements.length > 0 ? measurements : null;
}

/* ------------------------------------------------------------------------------------------------
 * 5) SIZE DISTRIBUTION (topic: analytics.size.distribution.v1)
 * ----------------------------------------------------------------------------------------------*/

const SizeDistributionSchema = z.object({
  schema: z.string().optional(),
  tenant_id: z.string().min(1),
  farm_id: z.string().min(1),
  house_id: z.string().min(1),
  flock_id: z.string().min(1),
  
  measurement_date: Time,
  weight_class: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE']),
  min_weight: z.number().finite(),
  max_weight: z.number().finite(),
  count: z.number().int(),
  percentage: z.number().finite().optional(),
  
  time: Time.optional(),
  ts: Time.optional(),
  meta: z.record(z.unknown()).optional()
}).refine(d => !!(d.time ?? d.ts), { path: ['time'], message: 'Required' });

export function toMeasurementsFromSizeDistribution(o: any): Measurement[] | null {
  const d = SizeDistributionSchema.parse(o);
  const time = d.time ?? d.ts!;
  
  const baseProps = {
    tenant_id: d.tenant_id,
    device_id: d.house_id,
    time,
    tags: {
      farm_id: d.farm_id,
      house_id: d.house_id,
      flock_id: d.flock_id,
      weight_class: d.weight_class,
      ...d.meta
    }
  };

  const measurements: Measurement[] = [
    { ...baseProps, metric: 'size.count', value: d.count, tags: { ...baseProps.tags, unit: 'count' } },
    { ...baseProps, metric: 'size.min_weight', value: d.min_weight, tags: { ...baseProps.tags, unit: 'kg' } },
    { ...baseProps, metric: 'size.max_weight', value: d.max_weight, tags: { ...baseProps.tags, unit: 'kg' } }
  ];

  if (d.percentage !== undefined) {
    measurements.push({ ...baseProps, metric: 'size.percentage', value: d.percentage, tags: { ...baseProps.tags, unit: 'percent' } });
  }

  return measurements;
}
