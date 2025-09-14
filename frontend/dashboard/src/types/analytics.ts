// Types for Cloud Analytics API responses

export type KpiResponse = {
  period: string;
  period_start: string; // ISO8601
  tenant_id: string;
  factory_id: string;
  machine_id: string;
  sensor_id?: string | null;
  metric: string;
  n: number;
  mean_val: number;
  stddev_val: number;
  cp?: number | null;
  cpk?: number | null;
  pp?: number | null;
  ppk?: number | null;
};

export type Aggregate = {
  bucket_start: string; // ISO8601
  window_s: number;
  tenant_id: string;
  factory_id: string;
  machine_id: string;
  sensor_id?: string | null;
  metric: string;
  count_n: number;
  sum_val: number;
  avg_val: number;
  min_val: number;
  max_val: number;
  stddev_val: number;
  p95_val: number;
};

export type Anomaly = {
  tenant_id: string;
  factory_id: string;
  machine_id: string;
  sensor_id?: string | null;
  metric: string;
  time: string; // ISO8601
  rule: string;
  value: number;
  mean: number;
  stddev: number;
};

export type FcrResult = {
  success: boolean;
  period: string;
  query: Record<string, unknown>;
  data: {
    period?: string;
    start_date?: string;
    end_date?: string;
    total_feed?: number;
    total_weight_gain?: number;
    fcr?: number;
  } | null;
};

export type SizeDistribution = {
  success: boolean;
  query: Record<string, unknown>;
  data: {
    measurement_date: string;
    buckets: Array<{ min: number; max: number; count: number }>;
    mean_weight?: number;
    stddev?: number;
  } | null;
};

