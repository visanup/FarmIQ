import { useQuery } from '@tanstack/react-query';
import analyticsClient from '../services/api/analyticsClient';
import { Aggregate, KpiResponse, Anomaly, FcrResult, SizeDistribution } from '../types/analytics';

export const useAnalyticsHealth = () =>
  useQuery({
    queryKey: ['analytics', 'health'],
    queryFn: () => analyticsClient.health(),
    staleTime: 60_000,
  });

export const useKpi = (params: {
  period?: 'day' | 'week' | 'month';
  metric?: string;
  tenant_id?: string;
  factory_id?: string;
  machine_id?: string;
  start?: string;
  end?: string;
  limit?: number;
}, enabled = true) =>
  useQuery<KpiResponse[]>({
    queryKey: ['analytics', 'kpi', params],
    queryFn: () => analyticsClient.getKpi(params),
    enabled,
  });

export const useAgg = (params: {
  tenant_id?: string;
  factory_id: string;
  machine_id: string;
  metric: string;
  window_s: number;
  start: string;
  end: string;
  sensor_id?: string;
  limit?: number;
}, enabled = true) =>
  useQuery<Aggregate[]>({
    queryKey: ['analytics', 'agg', params],
    queryFn: () => analyticsClient.getAgg(params),
    enabled,
  });

export const useAnomalies = (body: {
  tenant_id?: string;
  factory_id: string;
  machine_id: string;
  metric: string;
  window_s: number;
  start: string;
  end: string;
  sensor_id?: string;
  limit?: number;
}, enabled = true) =>
  useQuery<Anomaly[]>({
    queryKey: ['analytics', 'anomalies', body],
    queryFn: () => analyticsClient.detectAnomalies(body),
    enabled,
  });

export const useFcr = (params: {
  tenant_id?: string;
  house_id: string;
  farm_id?: string;
  start_date: string;
  end_date: string;
  animal_count?: number;
  period?: 'daily' | 'weekly' | 'total';
  weight_source?: 'scale' | 'predict' | 'both';
}, enabled = true) =>
  useQuery<FcrResult>({
    queryKey: ['analytics', 'fcr', params],
    queryFn: () => analyticsClient.getFcr(params),
    enabled,
  });

export const useSizeDistribution = (params: {
  tenant_id?: string;
  house_id: string;
  farm_id?: string;
  measurement_date: string;
  weight_source?: 'scale' | 'predict';
}, enabled = true) =>
  useQuery<SizeDistribution>({
    queryKey: ['analytics', 'size-distribution', params],
    queryFn: () => analyticsClient.getSizeDistribution(params),
    enabled,
  });

// Catalog hooks for dynamic selectors
export const useTenants = () =>
  useQuery<string[]>({
    queryKey: ['analytics', 'catalog', 'tenants'],
    queryFn: () => analyticsClient.getTenants(),
    staleTime: 5 * 60_000,
  });

export const useFactories = (tenant_id?: string) =>
  useQuery<string[]>({
    queryKey: ['analytics', 'catalog', 'factories', tenant_id],
    queryFn: () => analyticsClient.getFactories(tenant_id),
    staleTime: 5 * 60_000,
  });

export const useMachines = (params: { tenant_id?: string; factory_id?: string }, enabled = true) =>
  useQuery<string[]>({
    queryKey: ['analytics', 'catalog', 'machines', params],
    queryFn: () => analyticsClient.getMachines(params),
    enabled,
    staleTime: 5 * 60_000,
  });

export const useMetricsCatalog = (
  params: { tenant_id?: string; factory_id?: string; machine_id?: string },
  enabled = true,
) =>
  useQuery<string[]>({
    queryKey: ['analytics', 'catalog', 'metrics', params],
    queryFn: () => analyticsClient.getMetrics(params),
    enabled,
    staleTime: 5 * 60_000,
  });
