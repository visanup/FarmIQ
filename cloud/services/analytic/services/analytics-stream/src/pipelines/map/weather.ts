// src/pipelines/map/weather.ts

import { z } from 'zod';
import { normalizeTime } from './time';

const WeatherSchema = z.object({
  tenant_id: z.string(),        // หรือ 'global'
  station_id: z.string(),
  obs_time: normalizeTime,      // ชื่อ field ภายนอก
  temp_c: z.number().optional(),
  rh: z.number().optional(),
});

export function toMeasurementFromWeather(o:any) {
  const d = WeatherSchema.parse(o);
  if (typeof d.temp_c === 'number') {
    return {
      tenant_id: d.tenant_id,
      device_id: d.station_id,  // ใช้ station เป็น entity
      metric: 'weather.temp_c',
      value: d.temp_c,
      time: d.obs_time
    };
  }
  return null;
}
