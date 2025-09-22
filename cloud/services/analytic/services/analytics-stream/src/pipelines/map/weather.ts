// src/pipelines/map/weather.ts

import { z } from 'zod';
import { normalizeTime } from './time';
import type { Measurement } from '../../types/measurement';

const WeatherSchema = z.object({
  tenant_id: z.string(),        // หรือ 'global'
  station_id: z.string(),
  obs_time: normalizeTime,      // ชื่อ field ภายนอก
  temp_c: z.coerce.number().optional(),
  rh: z.coerce.number().optional(),
});

export function toMeasurementFromWeather(o: any): Measurement[] | null {
  const d = WeatherSchema.parse(o);

  const out: Measurement[] = [];

  if (typeof d.temp_c === 'number' && Number.isFinite(d.temp_c)) {
    out.push({
      tenant_id: d.tenant_id,
      device_id: d.station_id, // ใช้ station เป็น entity
      sensor_id: 'weather',
      metric: 'weather.temp_c',
      value: d.temp_c,
      time: d.obs_time,
    });
  }

  if (typeof d.rh === 'number' && Number.isFinite(d.rh)) {
    out.push({
      tenant_id: d.tenant_id,
      device_id: d.station_id,
      sensor_id: 'weather',
      metric: 'weather.rh', // relative humidity (percent)
      value: d.rh,
      time: d.obs_time,
      tags: { unit: 'percent' },
    });
  }

  return out.length ? out : null;
}
