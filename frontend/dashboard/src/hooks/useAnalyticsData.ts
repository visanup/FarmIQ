import { useState, useEffect, useCallback } from 'react';
import { masterServiceClient, sensorStreamerClient, analyticsServiceClient } from '../services/api';

interface UseAnalyticsDataOptions {
  selectedFarm?: string;
  selectedDevice?: string;
  selectedMetric?: string;
  timeRange?: number;
  enabled?: boolean;
}

interface AnalyticsData {
  farms: any[];
  devices: any[];
  sensorReadings: any[];
  performanceMetrics: any[];
  fcrData: any;
  sizeDistribution: any;
  anomalySummary: any;
  timeSeriesData: any[];
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = (key: string, data: any, ttl: number = CACHE_TTL) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
};

export const useAnalyticsData = (options: UseAnalyticsDataOptions = {}) => {
  const {
    selectedFarm = 'all',
    selectedDevice = 'all',
    selectedMetric = 'temperature',
    timeRange = 24,
    enabled = true
  } = options;

  const [data, setData] = useState<AnalyticsData>({
    farms: [],
    devices: [],
    sensorReadings: [],
    performanceMetrics: [],
    fcrData: null,
    sizeDistribution: null,
    anomalySummary: null,
    timeSeriesData: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const generateTimeSeriesData = useCallback((readings: any[]) => {
    const hourlyData = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourReadings = readings.filter(r => {
        const readingTime = new Date(r.timestamp);
        return readingTime.getHours() === hour.getHours() && 
               readingTime.getDate() === hour.getDate();
      });
      
      const tempReadings = hourReadings.filter(r => r.sensorType === 'temperature');
      const humidityReadings = hourReadings.filter(r => r.sensorType === 'humidity');
      const co2Readings = hourReadings.filter(r => r.sensorType === 'co2');
      
      hourlyData.push({
        time: hour.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        temperature: tempReadings.length > 0 ? 
          tempReadings.reduce((sum, r) => sum + (typeof r.value === 'number' ? r.value : 0), 0) / tempReadings.length : 
          Math.sin(i * 0.3) * 2 + 25, // Mock data
        humidity: humidityReadings.length > 0 ? 
          humidityReadings.reduce((sum, r) => sum + (typeof r.value === 'number' ? r.value : 0), 0) / humidityReadings.length : 
          Math.sin(i * 0.3) * 10 + 60, // Mock data
        co2: co2Readings.length > 0 ? 
          co2Readings.reduce((sum, r) => sum + (typeof r.value === 'number' ? r.value : 0), 0) / co2Readings.length : 
          Math.sin(i * 0.7) * 50 + 400, // Mock data
      });
    }
    
    return hourlyData;
  }, []);

  const loadData = useCallback(async () => {
    if (!enabled) return;

    const cacheKey = `analytics-${selectedFarm}-${selectedDevice}-${selectedMetric}-${timeRange}`;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      setData(cachedData);
      setLastUpdate(new Date());
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Load farms and devices from master service
      const [farmsData, devicesData] = await Promise.all([
        masterServiceClient.getFarms().catch(() => []),
        masterServiceClient.getDevices().catch(() => [])
      ]);

      // Load sensor readings from sensor streamer
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - timeRange * 60 * 60 * 1000);
      
      const readingsData = await sensorStreamerClient.getSensorReadings({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 1000
      }).catch(() => []);

      // Load performance metrics and analytics data in parallel
      const [metricsData, fcrData, sizeDistData, anomalyData] = await Promise.all([
        analyticsServiceClient.getPerformanceMetrics({
          tenant_id: 'default-tenant',
          factory_id: 'default-factory',
          machine_id: 'default-machine',
          metric: selectedMetric,
          period: 'hour',
          use_window_s: 60
        }).catch(() => []),
        
        analyticsServiceClient.getFCRCalculations({
          tenant_id: 'default-tenant',
          factory_id: 'default-factory',
          machine_id: 'default-machine'
        }).catch(() => null),
        
        analyticsServiceClient.getSizeDistribution({
          tenant_id: 'default-tenant',
          factory_id: 'default-factory',
          machine_id: 'default-machine'
        }).catch(() => null),
        
        analyticsServiceClient.getAnomalySummary({
          tenant_id: 'default-tenant',
          factory_id: 'default-factory',
          machine_id: 'default-machine'
        }).catch(() => null)
      ]);

      // Generate time series data
      const timeSeriesData = generateTimeSeriesData(readingsData || []);

      const newData: AnalyticsData = {
        farms: farmsData || [],
        devices: devicesData || [],
        sensorReadings: readingsData || [],
        performanceMetrics: metricsData || [],
        fcrData: fcrData || null,
        sizeDistribution: sizeDistData || null,
        anomalySummary: anomalyData || null,
        timeSeriesData
      };

      setData(newData);
      setCachedData(cacheKey, newData);
      setLastUpdate(new Date());
    } catch (err: any) {
      console.error('Error loading analytics data:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFarm, selectedDevice, selectedMetric, timeRange, enabled, generateTimeSeriesData]);

  const refresh = useCallback(() => {
    const cacheKey = `analytics-${selectedFarm}-${selectedDevice}-${selectedMetric}-${timeRange}`;
    cache.delete(cacheKey);
    loadData();
  }, [loadData, selectedFarm, selectedDevice, selectedMetric, timeRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    error,
    lastUpdate,
    refresh
  };
};