export const hourlySensors = [
  { metric: 'temperature', unit: '°C', min: 22, max: 35, variance: 1.5 },
  { metric: 'humidity', unit: '%', min: 40, max: 80, variance: 5 },
  { metric: 'CO2', unit: 'ppm', min: 300, max: 2000, variance: 50 },
  { metric: 'NH3', unit: 'ppm', min: 0, max: 50, variance: 2 },
  { metric: 'illuminance', unit: 'lux', min: 0, max: 8000, variance: 200 },
  { metric: 'photoperiod', unit: 'hours', min: 0, max: 24, variance: 0.5 },
  { metric: 'VOCs', unit: 'ppb', min: 0, max: 800, variance: 15 },
];

export const dailySensors = [
  { metric: 'pH', unit: 'pH', min: 6.0, max: 8.5, variance: 0.3 },
  { metric: 'TDS', unit: 'ppm', min: 100, max: 2000, variance: 50 },
  { metric: 'EC', unit: 'mS/cm', min: 0.2, max: 5.0, variance: 0.1 },
  { metric: 'water_volume', unit: 'L', min: 0, max: 5000, variance: 50 },
  { metric: 'water_temp', unit: '°C', min: 18, max: 28, variance: 1 },
];

export const feedSensor = { metric: 'feed.intake.kg', unit: 'kg' };

export const weightScaleMetric = 'sensors.weight_scale.current_kg';
export const weightPredictionMetric = 'sensors.weight_predict.current_kg';
