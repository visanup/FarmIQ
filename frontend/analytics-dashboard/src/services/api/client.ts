import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiResponse, SensorReading, DeviceHealth, AnalyticsFeature, TimeRange } from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = '/api') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post('/api/auth/refresh', {
                refreshToken,
              });
              
              const { accessToken, refreshToken: newRefreshToken } = response.data;
              localStorage.setItem('accessToken', accessToken);
              localStorage.setItem('refreshToken', newRefreshToken);
              
              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/signin';
            return Promise.reject(refreshError);
          }
        }
        
        if (error.response?.status === 401) {
          // Token refresh also failed or no refresh token
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/signin';
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Generic request methods
  async get(url: string, config?: AxiosRequestConfig) {
    return this.client.get(url, config);
  }

  async post(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.post(url, data, config);
  }

  async put(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.put(url, data, config);
  }

  async delete(url: string, config?: AxiosRequestConfig) {
    return this.client.delete(url, config);
  }

  // Health check
  async health(): Promise<{ status: string }> {
    const response = await this.client.get('/v1/health');
    return response.data;
  }

  // Analytics aggregated data
  async getAggregatedData(params: {
    tenant_id: string;
    device_id?: string;
    metric: string;
    window_s: number;
    start: string;
    end: string;
  }): Promise<ApiResponse<AnalyticsFeature[]>> {
    const response = await this.client.get('/v1/agg', { params });
    return response.data;
  }

  // Real-time sensor readings
  async getSensorReadings(params: {
    tenant_id: string;
    device_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<SensorReading[]>> {
    const response = await this.client.get('/v1/sensors/readings', { params });
    return response.data;
  }

  // Device health status
  async getDeviceHealth(params: {
    tenant_id: string;
    device_id?: string;
  }): Promise<ApiResponse<DeviceHealth[]>> {
    const response = await this.client.get('/v1/devices/health', { params });
    return response.data;
  }

  // Get metrics list
  async getMetrics(tenant_id: string): Promise<ApiResponse<string[]>> {
    const response = await this.client.get('/v1/metrics', {
      params: { tenant_id }
    });
    return response.data;
  }

  // Get devices list
  async getDevices(tenant_id: string): Promise<ApiResponse<string[]>> {
    const response = await this.client.get('/v1/devices', {
      params: { tenant_id }
    });
    return response.data;
  }

  // Time-series data for charts
  async getTimeSeriesData(params: {
    tenant_id: string;
    device_id: string;
    metric: string;
    timeRange: TimeRange;
    window?: '1m' | '5m' | '1h';
  }): Promise<ApiResponse<AnalyticsFeature[]>> {
    const { timeRange, window = '1m', ...otherParams } = params;
    const windowSeconds = window === '1m' ? 60 : window === '5m' ? 300 : 3600;
    
    return this.getAggregatedData({
      ...otherParams,
      window_s: windowSeconds,
      start: timeRange.start,
      end: timeRange.end,
    });
  }

  // Dashboard metrics summary
  async getDashboardSummary(tenant_id: string): Promise<ApiResponse<{
    totalDevices: number;
    onlineDevices: number;
    totalAlerts: number;
    criticalAlerts: number;
    lastUpdate: string;
  }>> {
    const response = await this.client.get('/v1/dashboard/summary', {
      params: { tenant_id }
    });
    return response.data;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
export default apiClient;