// API Configuration
// Centralized configuration for all API services

export const API_CONFIG = {
  // Base URLs for different services
  AUTH_SERVICE: import.meta.env.VITE_API_BASE_URL || 'http://localhost:7300/api',
  MASTER_SERVICE: import.meta.env.VITE_MASTER_SERVICE_URL || 'http://localhost:7307/api/v1',
  ANALYTICS_API: 'http://localhost:7304/v1',
  SENSOR_STREAMER: import.meta.env.VITE_SENSOR_STREAMER_URL || 'http://localhost:7302/api',
  
  // API Keys
  AUTH_SERVICE_API_KEY: import.meta.env.VITE_AUTH_SERVICE_API_KEY,
  MASTER_SERVICE_API_KEY: import.meta.env.VITE_MASTER_SERVICE_API_KEY || 'admin-key',
  ANALYTICS_API_KEY: import.meta.env.VITE_ANALYTICS_API_KEY || 'analytics-key',
  SENSOR_STREAMER_API_KEY: import.meta.env.VITE_SENSOR_STREAMER_API_KEY || 'sensor-key',
  
  // Optional: TMD Weather API
  TMD_API_TOKEN: import.meta.env.VITE_TMD_API_TOKEN,
  
  // Development mode
  DEV_MODE: import.meta.env.DEV || false,
  
  // WebSocket URLs (auto-generated from API URLs)
  get WS_AUTH_URL() {
    return this.AUTH_SERVICE.replace('http', 'ws') + '/ws';
  },
  get WS_ANALYTICS_URL() {
    return this.ANALYTICS_API.replace('http', 'ws') + '/ws';
  },
  get WS_SENSOR_URL() {
    return this.SENSOR_STREAMER.replace('http', 'ws') + '/ws';
  },
  
  // Request timeouts (in milliseconds)
  TIMEOUTS: {
    DEFAULT: 10000,
    UPLOAD: 30000,
    DOWNLOAD: 60000,
  },
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000,
    BACKOFF_FACTOR: 2,
  },
  
  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
} as const;

// Service health check endpoints
export const HEALTH_ENDPOINTS = {
  AUTH: `${API_CONFIG.AUTH_SERVICE}/health`,
  MASTER: `${API_CONFIG.MASTER_SERVICE}/health`,
  ANALYTICS: `${API_CONFIG.ANALYTICS_API}/health`,
  SENSOR: `${API_CONFIG.SENSOR_STREAMER}/health`,
} as const;

// Service status tracking
export class ServiceStatus {
  private static instance: ServiceStatus;
  private status: Record<string, boolean> = {};

  static getInstance(): ServiceStatus {
    if (!ServiceStatus.instance) {
      ServiceStatus.instance = new ServiceStatus();
    }
    return ServiceStatus.instance;
  }

  setServiceStatus(service: string, isOnline: boolean): void {
    this.status[service] = isOnline;
  }

  getServiceStatus(service: string): boolean {
    return this.status[service] ?? false;
  }

  getAllStatus(): Record<string, boolean> {
    return { ...this.status };
  }

  isAnyServiceOnline(): boolean {
    return Object.values(this.status).some(status => status);
  }
}

// Export singleton instance
export const serviceStatus = ServiceStatus.getInstance();
