// Base interfaces for FarmIQ Analytics Dashboard

export interface SensorReading {
  tenant_id: string;
  device_id: string;
  sensor_id: string;
  metric: string;
  value: number;
  time: string;
  tags?: Record<string, any>;
}

export interface DeviceHealth {
  tenant_id: string;
  device_id: string;
  status: 'online' | 'offline' | 'error';
  last_seen: string;
  battery_level?: number;
  signal_strength?: number;
  error_message?: string;
}

export interface AnalyticsFeature {
  bucket: string;
  tenant_id: string;
  device_id: string;
  metric: string;
  count: number;
  min: number;
  max: number;
  avg: number;
  stddev: number;
  window: '1m' | '5m' | '1h';
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'line-chart' | 'gauge' | 'status-grid' | 'alert-list' | 'metric-card';
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, any>;
  dataSource: string;
  refreshInterval: number;
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  device_id?: string;
  metric?: string;
  acknowledged: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
  }[];
}

export interface MetricConfig {
  key: string;
  label: string;
  unit: string;
  color: string;
  format?: 'number' | 'percentage' | 'temperature' | 'humidity';
  thresholds?: {
    warning: number;
    critical: number;
  };
}