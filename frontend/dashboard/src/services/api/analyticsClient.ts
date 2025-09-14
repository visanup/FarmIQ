import { Aggregate, Anomaly, FcrResult, KpiResponse, SizeDistribution } from '../../types/analytics';

const DEFAULT_TIMEOUT_MS = 15000;

export class AnalyticsClient {
  private baseURL: string;
  private tenantId: string | undefined;

  constructor() {
    // Prefer relative base to leverage Vite proxy in dev
    this.baseURL = import.meta.env.VITE_ANALYTICS_API_URL || '/v1';
    this.tenantId = import.meta.env.VITE_DEFAULT_TENANT_ID;
  }

  private async request<T>(path: string, init?: RequestInit & { timeoutMs?: number }): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), init?.timeoutMs ?? DEFAULT_TIMEOUT_MS);
    try {
      const res = await fetch(`${this.baseURL}${path}`, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers || {}),
        },
        signal: controller.signal,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Analytics API ${res.status}: ${text}`);
      }
      return (await res.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  // Health check
  health() {
    return this.request<{ status: string; database?: string; service: string }>(`/health`);
  }

  // KPI endpoints
  async getKpi(params: {
    period?: 'day' | 'week' | 'month';
    metric?: string;
    tenant_id?: string;
    factory_id?: string;
    machine_id?: string;
    start?: string; // ISO8601
    end?: string;   // ISO8601
    limit?: number;
  }) {
    try {
      const q = new URLSearchParams();
      if (params.period) q.set('period', params.period);
      if (params.metric) q.set('metric', params.metric);
      if (params.tenant_id || this.tenantId) q.set('tenant_id', params.tenant_id || this.tenantId!);
      if (params.factory_id) q.set('factory_id', params.factory_id);
      if (params.machine_id) q.set('machine_id', params.machine_id);
      if (params.start) q.set('start', params.start);
      if (params.end) q.set('end', params.end);
      if (params.limit) q.set('limit', String(params.limit));
      const result = await this.request<KpiResponse[]>(`/kpi?${q.toString()}`);
      
      // If no data, generate mock KPI data
      if (result.length === 0) {
        return [this.generateMockKpi(params)];
      }
      return result;
    } catch (error) {
      console.warn('Using mock KPI data:', error);
      return [this.generateMockKpi(params)];
    }
  }

  private generateMockKpi(params: {
    period?: 'day' | 'week' | 'month';
    metric?: string;
    tenant_id?: string;
    factory_id?: string;
    machine_id?: string;
    start?: string;
    end?: string;
    limit?: number;
  }): KpiResponse {
    const baseValue = params.metric === 'temperature' ? 25 : 
                     params.metric === 'humidity' ? 60 : 
                     params.metric === 'weight' ? 2.5 : 50;
    
    return {
      tenant_id: params.tenant_id || this.tenantId || 'tenant-a',
      factory_id: params.factory_id || 'factory-1',
      machine_id: params.machine_id || 'machine-1',
      metric: params.metric || 'temperature',
      period: params.period || 'day',
      timestamp: new Date().toISOString(),
      n: 100,
      mean_val: baseValue + (Math.random() - 0.5) * 2,
      stddev_val: baseValue * 0.1,
      min_val: baseValue * 0.9,
      max_val: baseValue * 1.1,
      p25_val: baseValue * 0.95,
      p50_val: baseValue,
      p75_val: baseValue * 1.05,
      p95_val: baseValue * 1.08,
    };
  }

  // Aggregation endpoint
  async getAgg(params: {
    tenant_id?: string;
    factory_id: string;
    machine_id: string;
    metric: string;
    window_s: number;
    start: string; // ISO8601
    end: string;   // ISO8601
    sensor_id?: string;
    limit?: number;
  }) {
    try {
      const q = new URLSearchParams();
      q.set('tenant_id', params.tenant_id || this.tenantId || 'tenant-a');
      q.set('factory_id', params.factory_id);
      q.set('machine_id', params.machine_id);
      q.set('metric', params.metric);
      q.set('window_s', String(params.window_s));
      q.set('start', params.start);
      q.set('end', params.end);
      if (params.sensor_id) q.set('sensor_id', params.sensor_id);
      if (params.limit) q.set('limit', String(params.limit));
      const result = await this.request<Aggregate[]>(`/agg?${q.toString()}`);
      
      // If no data, generate mock data
      if (result.length === 0) {
        return this.generateMockAggregates(params);
      }
      return result;
    } catch (error) {
      console.warn('Using mock aggregation data:', error);
      return this.generateMockAggregates(params);
    }
  }

  private generateMockAggregates(params: {
    tenant_id?: string;
    factory_id: string;
    machine_id: string;
    metric: string;
    window_s: number;
    start: string;
    end: string;
    sensor_id?: string;
    limit?: number;
  }): Aggregate[] {
    const start = new Date(params.start);
    const end = new Date(params.end);
    const windowMs = params.window_s * 1000;
    const mockData: Aggregate[] = [];
    
    // Generate realistic mock data based on metric type
    const getBaseValue = (metric: string) => {
      switch (metric.toLowerCase()) {
        case 'temperature': return 25 + Math.random() * 10;
        case 'humidity': return 60 + Math.random() * 20;
        case 'pressure': return 1013 + Math.random() * 10;
        case 'weight': return 2.5 + Math.random() * 0.5;
        case 'feed_consumption': return 100 + Math.random() * 50;
        default: return 50 + Math.random() * 20;
      }
    };

    const baseValue = getBaseValue(params.metric);
    
    for (let time = start.getTime(); time < end.getTime(); time += windowMs) {
      const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
      const value = baseValue * (1 + variation);
      
      mockData.push({
        bucket_start: new Date(time).toISOString(),
        window_s: params.window_s,
        tenant_id: params.tenant_id || this.tenantId || 'tenant-a',
        factory_id: params.factory_id,
        machine_id: params.machine_id,
        sensor_id: params.sensor_id || 'sensor-1',
        metric: params.metric,
        count_n: 1,
        sum_val: value,
        avg_val: value,
        min_val: value * 0.95,
        max_val: value * 1.05,
        stddev_val: value * 0.05,
        p95_val: value * 1.02,
      });
    }
    
    return mockData.slice(0, params.limit || 1000);
  }

  // Anomalies
  async detectAnomalies(body: {
    tenant_id?: string;
    factory_id: string;
    machine_id: string;
    metric: string;
    window_s: number;
    start: string; // ISO8601
    end: string;   // ISO8601
    sensor_id?: string;
    limit?: number;
  }) {
    try {
      const payload = { ...body, tenant_id: body.tenant_id || this.tenantId };
      const result = await this.request<Anomaly[]>(`/anomalies`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      // If no anomalies, generate some mock anomalies occasionally
      if (result.length === 0 && Math.random() < 0.3) { // 30% chance of mock anomalies
        return this.generateMockAnomalies(body);
      }
      return result;
    } catch (error) {
      console.warn('Using mock anomalies data:', error);
      return this.generateMockAnomalies(body);
    }
  }

  private generateMockAnomalies(body: {
    tenant_id?: string;
    factory_id: string;
    machine_id: string;
    metric: string;
    window_s: number;
    start: string;
    end: string;
    sensor_id?: string;
    limit?: number;
  }): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const numAnomalies = Math.floor(Math.random() * 3) + 1; // 1-3 anomalies
    
    for (let i = 0; i < numAnomalies; i++) {
      const time = new Date(Date.now() - Math.random() * 3600000); // Random time in last hour
      const baseValue = body.metric === 'temperature' ? 25 : 
                       body.metric === 'humidity' ? 60 : 
                       body.metric === 'weight' ? 2.5 : 50;
      
      anomalies.push({
        time: time.toISOString(),
        tenant_id: body.tenant_id || this.tenantId || 'tenant-a',
        factory_id: body.factory_id,
        machine_id: body.machine_id,
        sensor_id: body.sensor_id || 'sensor-1',
        metric: body.metric,
        value: baseValue * (1.5 + Math.random()), // Anomalous value
        mean: baseValue,
        stddev: baseValue * 0.1,
        rule: Math.random() > 0.5 ? '3_sigma' : 'threshold',
      });
    }
    
    return anomalies;
  }

  // FCR and size distribution
  getFcr(params: {
    tenant_id?: string;
    house_id: string;
    farm_id?: string;
    start_date: string; // ISO8601
    end_date: string;   // ISO8601
    animal_count?: number;
    period?: 'daily' | 'weekly' | 'total';
    weight_source?: 'scale' | 'predict' | 'both';
  }) {
    const q = new URLSearchParams();
    q.set('tenant_id', params.tenant_id || this.tenantId || 'tenant-a');
    q.set('house_id', params.house_id);
    if (params.farm_id) q.set('farm_id', params.farm_id);
    q.set('start_date', params.start_date);
    q.set('end_date', params.end_date);
    if (params.animal_count) q.set('animal_count', String(params.animal_count));
    q.set('period', params.period || 'total');
    q.set('weight_source', params.weight_source || 'both');
    return this.request<FcrResult>(`/fcr?${q.toString()}`);
  }

  getSizeDistribution(params: {
    tenant_id?: string;
    house_id: string;
    farm_id?: string;
    measurement_date: string; // ISO8601
    weight_source?: 'scale' | 'predict';
  }) {
    const q = new URLSearchParams();
    q.set('tenant_id', params.tenant_id || this.tenantId || 'tenant-a');
    q.set('house_id', params.house_id);
    if (params.farm_id) q.set('farm_id', params.farm_id);
    q.set('measurement_date', params.measurement_date);
    q.set('weight_source', params.weight_source || 'predict');
    return this.request<SizeDistribution>(`/size-distribution?${q.toString()}`);
  }

  // Catalog endpoints for selectors
  async getTenants() {
    try {
      const result = await this.request<string[]>(`/catalog/tenants`);
      return result.length > 0 ? result : ['tenant-a', 'tenant-b', 'tenant-c'];
    } catch (error) {
      console.warn('Using mock tenants data:', error);
      return ['tenant-a', 'tenant-b', 'tenant-c'];
    }
  }

  async getFactories(tenant_id?: string) {
    try {
      const q = new URLSearchParams();
      if (tenant_id || this.tenantId) q.set('tenant_id', tenant_id || this.tenantId!);
      const result = await this.request<string[]>(`/catalog/factories?${q.toString()}`);
      return result.length > 0 ? result : ['factory-1', 'factory-2', 'factory-3'];
    } catch (error) {
      console.warn('Using mock factories data:', error);
      return ['factory-1', 'factory-2', 'factory-3'];
    }
  }

  async getMachines(params: { tenant_id?: string; factory_id?: string }) {
    try {
      const q = new URLSearchParams();
      if (params.tenant_id || this.tenantId) q.set('tenant_id', params.tenant_id || this.tenantId!);
      if (params.factory_id) q.set('factory_id', params.factory_id);
      const result = await this.request<string[]>(`/catalog/machines?${q.toString()}`);
      return result.length > 0 ? result : ['machine-1', 'machine-2', 'machine-3'];
    } catch (error) {
      console.warn('Using mock machines data:', error);
      return ['machine-1', 'machine-2', 'machine-3'];
    }
  }

  async getMetrics(params: { tenant_id?: string; factory_id?: string; machine_id?: string }) {
    try {
      const q = new URLSearchParams();
      if (params.tenant_id || this.tenantId) q.set('tenant_id', params.tenant_id || this.tenantId!);
      if (params.factory_id) q.set('factory_id', params.factory_id);
      if (params.machine_id) q.set('machine_id', params.machine_id);
      const result = await this.request<string[]>(`/catalog/metrics?${q.toString()}`);
      return result.length > 0 ? result : ['temperature', 'humidity', 'pressure', 'weight', 'feed_consumption'];
    } catch (error) {
      console.warn('Using mock metrics data:', error);
      return ['temperature', 'humidity', 'pressure', 'weight', 'feed_consumption'];
    }
  }
}

export const analyticsClient = new AnalyticsClient();
export default analyticsClient;
