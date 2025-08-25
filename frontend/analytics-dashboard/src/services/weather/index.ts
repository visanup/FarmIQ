// Weather services index
export { default as TMDService, tmdService, THAILAND_REGIONS } from './tmdService';
export { default as MockTMDService, mockTMDService } from './mockTMDService';
export type { ProcessedWeatherData, TMDAreaForecastParams, TMDWeatherData } from './tmdService';

import { tmdService } from './tmdService';
import { mockTMDService } from './mockTMDService';

// Service selector - use mock service for development/demo
// In production with real API token, change this to use tmdService
const USE_MOCK_SERVICE = !import.meta.env.VITE_TMD_API_TOKEN || import.meta.env.DEV;

export const weatherService = USE_MOCK_SERVICE ? mockTMDService : tmdService;