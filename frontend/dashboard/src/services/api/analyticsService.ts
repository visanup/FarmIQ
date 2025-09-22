// Analytics Service API Client
// Connects to Analytics API (port 7305) for analytics data
import { 
  SensorReading, 
  PerformanceMetric,
  HealthRecord,
  TimeSeriesData,
  ChartDataPoint,
  PaginatedResponse 
} from '../../types/api';
import { API_CONFIG } from '../../config/api';

export interface AnalyticsFilters {
  farmId?: string;
  houseId?: string;
  deviceId?: string;
  animalId?: string;
  startDate?: string;
  endDate?: string;
  metric?: string;
  sensorType?: string;
  limit?: number;
  page?: number;
}

export interface KPIMetrics {
  farmId: string;
  metric: string;
  value: number;
  unit: string;
  timestamp: string;
  trend?: 'up' | 'down' | 'stable';
  change?: number;
}

export interface AnomalyDetection {
  id: string;
  deviceId: string;
  farmId: string;
  metric: string;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  description: string;
}

export interface FCRCalculation {
  farmId: string;
  houseId?: string;
  period: string;
  feedConsumption: number;
  weightGain: number;
  fcr: number;
  efficiency: 'excellent' | 'good' | 'average' | 'poor';
  recommendations: string[];
}

export interface SizeDistribution {
  farmId: string;
  houseId?: string;
  animalType: string;
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  distribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}

class AnalyticsServiceClient {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:7304/v1') {
    this.baseURL = baseURL;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const accessToken = localStorage.getItem('accessToken');
    const res = await fetch(`${this.baseURL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-API-Key': API_CONFIG.ANALYTICS_API_KEY,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(init?.headers || {}),
      },
      credentials: 'include',
    });

    if (!res.ok) {
      const raw = await res.text();
      let message: string | undefined;
      try {
        const data = raw ? JSON.parse(raw) : undefined;
        message = data?.message || data?.error;
      } catch {
        message = raw;
      }
      throw new Error(message || `Analytics API request failed with status ${res.status}`);
    }
    return (await res.json()) as T;
  }

  private buildQueryString(filters: AnalyticsFilters): string {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });
    return params.toString();
  }

  // Sensor Data Analytics - Use real data from Sensor Streamer
  async getSensorReadings(filters: AnalyticsFilters): Promise<SensorReading[]> {
    try {
      // Use real data from Sensor Streamer Service
      const queryString = this.buildQueryString(filters);
      const url = queryString ? `/sensor-readings?${queryString}` : '/sensor-readings';
      const response = await this.request<{readings: SensorReading[], total: number, page: number, limit: number}>(url);
      return response?.readings || [];
    } catch (error) {
      console.warn('Analytics Service unavailable:', error);
      return [];
    }
  }

  private getMockSensorValue(sensorType: string, hourOffset: number): number {
    const baseValues: Record<string, number> = {
      temperature: 25 + Math.sin(hourOffset * 0.5) * 5,
      humidity: 60 + Math.sin(hourOffset * 0.3) * 20,
      air_quality: 50 + Math.sin(hourOffset * 0.2) * 30,
      pressure: 1013 + Math.sin(hourOffset * 0.1) * 10,
      light: 500 + Math.sin(hourOffset * 0.4) * 200
    };
    return Math.round((baseValues[sensorType] + Math.random() * 2 - 1) * 10) / 10;
  }

  private getSensorUnit(sensorType: string): string {
    const units: Record<string, string> = {
      temperature: '°C',
      humidity: '%',
      air_quality: 'AQI',
      pressure: 'hPa',
      light: 'lux'
    };
    return units[sensorType] || '';
  }

  async getSensorTimeSeries(filters: AnalyticsFilters): Promise<TimeSeriesData[]> {
    try {
      const queryString = this.buildQueryString(filters);
      const url = queryString ? `/sensor-readings/time-series?${queryString}` : '/sensor-readings/time-series';
      return await this.request<TimeSeriesData[]>(url);
    } catch (error) {
      console.warn('Analytics Service unavailable:', error);
      return [];
    }
  }

  // Performance Metrics - Use mock data for now (KPI endpoint has DB schema issues)
  async getPerformanceMetrics(filters: AnalyticsFilters): Promise<PerformanceMetric[]> {
    try {
      // For now, return mock data since KPI endpoint has database schema issues
      console.warn('Using mock performance metrics - KPI endpoint has DB schema issues');
      return [
        {
          id: '1',
          farmId: filters.farmId || 'farm-1',
          metric: filters.metric || 'temperature',
          value: 25.5 + Math.random() * 5,
          unit: '°C',
          timestamp: new Date().toISOString(),
          trend: 'stable' as const
        },
        {
          id: '2',
          farmId: filters.farmId || 'farm-1',
          metric: 'humidity',
          value: 65.2 + Math.random() * 10,
          unit: '%',
          timestamp: new Date().toISOString(),
          trend: 'up' as const
        },
        {
          id: '3',
          farmId: filters.farmId || 'farm-1',
          metric: 'air_quality',
          value: 45.8 + Math.random() * 15,
          unit: 'AQI',
          timestamp: new Date().toISOString(),
          trend: 'down' as const
        }
      ];
    } catch (error) {
      console.warn('Analytics Service unavailable:', error);
      return [];
    }
  }

  async getPerformanceTimeSeries(filters: AnalyticsFilters): Promise<TimeSeriesData[]> {
    try {
      const queryString = this.buildQueryString(filters);
      const url = queryString ? `/performance-metrics/time-series?${queryString}` : '/performance-metrics/time-series';
      return await this.request<TimeSeriesData[]>(url);
    } catch (error) {
      console.warn('Analytics Service unavailable:', error);
      return [];
    }
  }

  // Health Records
  async getHealthRecords(filters: AnalyticsFilters): Promise<HealthRecord[]> {
    try {
      const queryString = this.buildQueryString(filters);
      const url = queryString ? `/health-records?${queryString}` : '/health-records';
      const response = await this.request<PaginatedResponse<HealthRecord>>(url);
      return response?.data || [];
    } catch (error) {
      console.warn('Analytics Service unavailable:', error);
      return [];
    }
  }

  // KPI Calculations - Use mock data for now (KPI endpoint has DB schema issues)
  async getKPIMetrics(filters: AnalyticsFilters): Promise<KPIMetrics[]> {
    try {
      // For now, return mock data since KPI endpoint has database schema issues
      console.warn('Using mock KPI metrics - KPI endpoint has DB schema issues');
      return [
        {
          farmId: filters.farmId || 'farm-1',
          metric: filters.metric || 'temperature',
          value: 25.5 + Math.random() * 5,
          unit: '°C',
          timestamp: new Date().toISOString(),
          trend: 'stable' as const
        },
        {
          farmId: filters.farmId || 'farm-1',
          metric: 'humidity',
          value: 65.2 + Math.random() * 10,
          unit: '%',
          timestamp: new Date().toISOString(),
          trend: 'up' as const
        }
      ];
    } catch (error) {
      console.warn('Analytics Service unavailable:', error);
      return [];
    }
  }

  async getKPITimeSeries(filters: AnalyticsFilters): Promise<TimeSeriesData[]> {
    try {
      // For now, return mock data since KPI endpoint has database schema issues
      console.warn('Using mock KPI time series - KPI endpoint has DB schema issues');
      return [];
    } catch (error) {
      console.warn('Analytics Service unavailable:', error);
      return [];
    }
  }

  // Anomaly Detection
  async getAnomalies(filters: AnalyticsFilters): Promise<AnomalyDetection[]> {
    const queryString = this.buildQueryString(filters);
    const url = queryString ? `/anomalies?${queryString}` : '/anomalies';
    return this.request<AnomalyDetection[]>(url);
  }

  async getAnomalySummary(filters: AnalyticsFilters): Promise<{
    total: number;
    bySeverity: Record<string, number>;
    byMetric: Record<string, number>;
    recent: AnomalyDetection[];
  }> {
    try {
      const queryString = this.buildQueryString(filters);
      const url = queryString ? `/anomalies/summary?${queryString}` : '/anomalies/summary';
      return await this.request<{
        total: number;
        bySeverity: Record<string, number>;
        byMetric: Record<string, number>;
        recent: AnomalyDetection[];
      }>(url);
    } catch (error) {
      console.warn('Failed to fetch anomaly summary, using mock data:', error);
      return this.getMockAnomalySummaryData();
    }
  }

  // FCR Calculations
  async getFCRCalculations(filters: AnalyticsFilters): Promise<FCRCalculation[]> {
    try {
      const queryString = this.buildQueryString(filters);
      const url = queryString ? `/fcr?${queryString}` : '/fcr';
      return await this.request<FCRCalculation[]>(url);
    } catch (error) {
      console.warn('Failed to fetch FCR calculations, using mock data:', error);
      return this.getMockFCRData();
    }
  }

  async getFCRTimeSeries(filters: AnalyticsFilters): Promise<TimeSeriesData[]> {
    const queryString = this.buildQueryString(filters);
    const url = queryString ? `/fcr/time-series?${queryString}` : '/fcr/time-series';
    return this.request<TimeSeriesData[]>(url);
  }

  // Size Distribution Analysis
  async getSizeDistribution(filters: AnalyticsFilters): Promise<SizeDistribution[]> {
    try {
      const queryString = this.buildQueryString(filters);
      const url = queryString ? `/size-distribution?${queryString}` : '/size-distribution';
      return await this.request<SizeDistribution[]>(url);
    } catch (error) {
      console.warn('Failed to fetch size distribution, using mock data:', error);
      return this.getMockSizeDistributionData();
    }
  }

  // Aggregated Data
  async getAggregatedData(filters: AnalyticsFilters & {
    window?: 'minute' | 'hour' | 'day' | 'week' | 'month';
    aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'count';
  }): Promise<Array<{
    timestamp: string;
    metric: string;
    value: number;
    unit: string;
    count: number;
  }>> {
    const queryString = this.buildQueryString(filters);
    const url = queryString ? `/aggregated?${queryString}` : '/aggregated';
    return this.request<Array<{
      timestamp: string;
      metric: string;
      value: number;
      unit: string;
      count: number;
    }>>(url);
  }

  // Dashboard Summary
  async getDashboardSummary(filters: AnalyticsFilters): Promise<{
    totalFarms: number;
    totalDevices: number;
    onlineDevices: number;
    totalAnimals: number;
    activeAlerts: number;
    criticalAlerts: number;
    lastUpdate: string;
    metrics: {
      avgTemperature: number;
      avgHumidity: number;
      avgWeight: number;
      productionRate: number;
    };
  }> {
    const queryString = this.buildQueryString(filters);
    const url = queryString ? `/dashboard/summary?${queryString}` : '/dashboard/summary';
    return this.request<{
      totalFarms: number;
      totalDevices: number;
      onlineDevices: number;
      totalAnimals: number;
      activeAlerts: number;
      criticalAlerts: number;
      lastUpdate: string;
      metrics: {
        avgTemperature: number;
        avgHumidity: number;
        avgWeight: number;
        productionRate: number;
      };
    }>(url);
  }

  // Real-time Data (WebSocket)
  getWebSocketURL(): string {
    return this.baseURL.replace('http', 'ws') + '/ws';
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }

  // Mock data methods
  private getMockFCRData(): FCRCalculation[] {
    return [
      {
        id: 'fcr-1',
        date: new Date().toISOString(),
        farm_id: 'farm-1',
        flock_id: 'flock-1',
        fcr_value: 1.8,
        feed_intake: 2.5,
        weight_gain: 1.4,
        efficiency_score: 0.85,
        trend: 'improving'
      },
      {
        id: 'fcr-2',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        farm_id: 'farm-1',
        flock_id: 'flock-1',
        fcr_value: 1.9,
        feed_intake: 2.6,
        weight_gain: 1.3,
        efficiency_score: 0.82,
        trend: 'stable'
      }
    ];
  }

  private getMockSizeDistributionData(): SizeDistribution[] {
    return [
      {
        id: 'size-1',
        date: new Date().toISOString(),
        farm_id: 'farm-1',
        flock_id: 'flock-1',
        weight_ranges: [
          { min: 0, max: 1, count: 5, percentage: 10 },
          { min: 1, max: 2, count: 15, percentage: 30 },
          { min: 2, max: 3, count: 20, percentage: 40 },
          { min: 3, max: 4, count: 10, percentage: 20 }
        ],
        average_weight: 2.1,
        standard_deviation: 0.8,
        coefficient_variation: 0.38
      }
    ];
  }

  private getMockAnomalySummaryData(): {
    total: number;
    bySeverity: Record<string, number>;
    byMetric: Record<string, number>;
    recent: AnomalyDetection[];
  } {
    return {
      total: 12,
      bySeverity: {
        low: 3,
        medium: 5,
        high: 3,
        critical: 1
      },
      byMetric: {
        temperature: 4,
        humidity: 3,
        weight: 2,
        feed_intake: 3
      },
      recent: [
        {
          id: 'anomaly-1',
          timestamp: new Date().toISOString(),
          metric: 'temperature',
          value: 35.5,
          threshold: 30.0,
          severity: 'high',
          description: 'Temperature spike detected',
          farm_id: 'farm-1',
          device_id: 'device-1'
        },
        {
          id: 'anomaly-2',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          metric: 'humidity',
          value: 15.2,
          threshold: 20.0,
          severity: 'medium',
          description: 'Low humidity detected',
          farm_id: 'farm-1',
          device_id: 'device-2'
        }
      ]
    };
  }
}

// Create singleton instance
export const analyticsServiceClient = new AnalyticsServiceClient();
export default analyticsServiceClient;
