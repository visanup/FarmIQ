// API Services Index
// Centralized export for all API services

// Core API Client (Auth Service)
export { default as apiClient } from './client';

// Master Service Client
export { default as masterServiceClient } from './masterService';

// Analytics Service Client
export { 
  default as analyticsServiceClient,
  type AnalyticsFilters,
  type KPIMetrics,
  type AnomalyDetection,
  type FCRCalculation,
  type SizeDistribution
} from './analyticsService';

// Sensor Streamer Client (existing)
export { default as sensorStreamerClient } from './sensorClient';

// Notification Service Client
export { notificationServiceClient } from './notificationService';

// Re-export types for convenience
export type {
  User,
  Customer,
  Farm,
  House,
  Device,
  Animal,
  SensorReading,
  DeviceHealth,
  PerformanceMetric,
  HealthRecord,
  DashboardFilters,
  DashboardMetrics,
  TimeSeriesData,
  ChartDataPoint,
  Alert
} from '../../types/api';
