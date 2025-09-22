import { useState, useEffect, useCallback } from 'react';
import { masterServiceClient, sensorStreamerClient, analyticsServiceClient } from '../services/api';

interface UseReportsDataOptions {
  enabled?: boolean;
}

interface ReportsData {
  farms: any[];
  devices: any[];
  sensorReadings: any[];
  performanceMetrics: any[];
  fcrData: any;
  sizeDistribution: any;
  anomalySummary: any;
  lastUpdate: string;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes (reports can be cached longer)

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

export const useReportsData = (options: UseReportsDataOptions = {}) => {
  const { enabled = true } = options;

  const [data, setData] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const loadData = useCallback(async () => {
    if (!enabled) return;

    const cacheKey = 'reports-data';
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      setData(cachedData);
      setLastUpdate(new Date().toLocaleString('th-TH'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Load all data in parallel for better performance
      const [farms, devices, sensorReadings, performanceMetrics, fcrData, sizeDistribution, anomalySummary] = await Promise.all([
        masterServiceClient.getFarms().catch(() => []),
        masterServiceClient.getDevices().catch(() => []),
        sensorStreamerClient.getSensorReadings().catch(() => []),
        analyticsServiceClient.getPerformanceMetrics().catch(() => []),
        analyticsServiceClient.getFCRCalculations().catch(() => null),
        analyticsServiceClient.getSizeDistribution().catch(() => null),
        analyticsServiceClient.getAnomalySummary().catch(() => null),
      ]);

      const newData: ReportsData = {
        farms: farms || [],
        devices: devices || [],
        sensorReadings: sensorReadings || [],
        performanceMetrics: performanceMetrics || [],
        fcrData: fcrData || null,
        sizeDistribution: sizeDistribution || null,
        anomalySummary: anomalySummary || null,
        lastUpdate: new Date().toLocaleString('th-TH'),
      };

      setData(newData);
      setCachedData(cacheKey, newData);
      setLastUpdate(newData.lastUpdate);
    } catch (err: any) {
      console.error('Error loading reports data:', err);
      setError(err.message || 'Failed to load reports data');
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  const refresh = useCallback(() => {
    const cacheKey = 'reports-data';
    cache.delete(cacheKey);
    loadData();
  }, [loadData]);

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
