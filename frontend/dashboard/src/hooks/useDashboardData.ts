import { useQuery } from '@tanstack/react-query';
import { masterServiceClient, sensorStreamerClient, analyticsServiceClient } from '../services/api';
import { useState } from 'react';

export const useDashboardData = () => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: async () => {
      try {
        // Load all data in parallel
        const [farmsData, devicesData, animalsData, healthData, readingsData, metricsData] = await Promise.all([
          masterServiceClient.getFarms().catch(() => []),
          masterServiceClient.getDevices().catch(() => []),
          masterServiceClient.getAnimals().catch(() => []),
          sensorStreamerClient.getDeviceHealth().catch(() => []),
          sensorStreamerClient.getSensorReadings({
            startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString(),
            limit: 1000
          }).catch(() => []),
          analyticsServiceClient.getPerformanceMetrics({
            tenant_id: 'default-tenant',
            factory_id: 'default-factory',
            machine_id: 'default-machine',
            metric: 'temperature',
            period: 'hour',
            use_window_s: 60
          }).catch(() => [])
        ]);

        setLastUpdate(new Date());

        return {
          farms: farmsData || [],
          devices: devicesData || [],
          animals: animalsData || [],
          deviceHealth: healthData || [],
          sensorReadings: readingsData || [],
          performanceMetrics: metricsData || [],
        };
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    data: data || {
      farms: [],
      devices: [],
      animals: [],
      deviceHealth: [],
      sensorReadings: [],
      performanceMetrics: [],
    },
    isLoading,
    error: error ? error.message : null,
    lastUpdate,
    refresh: refetch,
  };
};
