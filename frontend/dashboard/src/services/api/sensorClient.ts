// Sensor Streamer Service API Client
// Connects to Sensor Streamer Service (port 7302) for sensor data
import { 
  SensorReading, 
  DeviceHealth,
  LabReading,
  SweepReading,
  PaginatedResponse 
} from '../../types/api';
import { API_CONFIG } from '../../config/api';

export interface SensorFilters {
  deviceId?: string;
  farmId?: string;
  houseId?: string;
  sensorType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
}

class SensorStreamerClient {
  private baseURL: string;

  constructor(baseURL: string = import.meta.env.VITE_SENSOR_STREAMER_URL || 'http://localhost:7302/api') {
    this.baseURL = baseURL;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const accessToken = localStorage.getItem('accessToken');
    const res = await fetch(`${this.baseURL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-API-Key': API_CONFIG.SENSOR_STREAMER_API_KEY,
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
      throw new Error(message || `Sensor Streamer request failed with status ${res.status}`);
    }
    return (await res.json()) as T;
  }

  private buildQueryString(filters: SensorFilters): string {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });
    return params.toString();
  }

  // Sensor Readings
  async getSensorReadings(filters: SensorFilters): Promise<SensorReading[]> {
    try {
      const queryString = this.buildQueryString(filters);
      const url = queryString ? `/sensor-readings?${queryString}` : '/sensor-readings';
      const response = await this.request<{readings: SensorReading[], total: number, page: number, limit: number}>(url);
      return response?.readings || [];
    } catch (error) {
      console.warn('Sensor Streamer Service unavailable:', error);
      return [];
    }
  }

  async getSensorReading(id: string): Promise<SensorReading> {
    return this.request<SensorReading>(`/sensor-readings/${id}`);
  }

  async createSensorReading(reading: Omit<SensorReading, 'id' | 'createdAt'>): Promise<SensorReading> {
    return this.request<SensorReading>('/sensor-readings', {
      method: 'POST',
      body: JSON.stringify(reading),
    });
  }

  // Device Health
  async getDeviceHealth(filters?: { deviceId?: string }): Promise<DeviceHealth[]> {
    try {
      const queryString = filters ? this.buildQueryString(filters) : '';
      const url = queryString ? `/device-health?${queryString}` : '/device-health';
      const response = await this.request<PaginatedResponse<DeviceHealth>>(url);
      return response?.data || [];
    } catch (error) {
      console.warn('Sensor Streamer Service unavailable:', error);
      return [];
    }
  }

  async getDeviceHealthById(id: string): Promise<DeviceHealth> {
    return this.request<DeviceHealth>(`/device-health/${id}`);
  }

  async updateDeviceHealth(id: string, health: Partial<DeviceHealth>): Promise<DeviceHealth> {
    return this.request<DeviceHealth>(`/device-health/${id}`, {
      method: 'PUT',
      body: JSON.stringify(health),
    });
  }

  // Lab Readings
  async getLabReadings(filters: SensorFilters): Promise<LabReading[]> {
    try {
      const queryString = this.buildQueryString(filters);
      const url = queryString ? `/lab-readings?${queryString}` : '/lab-readings';
      const response = await this.request<PaginatedResponse<LabReading>>(url);
      return response?.data || [];
    } catch (error) {
      console.warn('Sensor Streamer Service unavailable:', error);
      return [];
    }
  }

  async getLabReading(id: string): Promise<LabReading> {
    return this.request<LabReading>(`/lab-readings/${id}`);
  }

  async createLabReading(reading: Omit<LabReading, 'id' | 'createdAt'>): Promise<LabReading> {
    return this.request<LabReading>('/lab-readings', {
      method: 'POST',
      body: JSON.stringify(reading),
    });
  }

  // Sweep Readings
  async getSweepReadings(filters: SensorFilters): Promise<SweepReading[]> {
    try {
      const queryString = this.buildQueryString(filters);
      const url = queryString ? `/sweep-readings?${queryString}` : '/sweep-readings';
      const response = await this.request<PaginatedResponse<SweepReading>>(url);
      return response?.data || [];
    } catch (error) {
      console.warn('Sensor Streamer Service unavailable:', error);
      return [];
    }
  }

  async getSweepReading(id: string): Promise<SweepReading> {
    return this.request<SweepReading>(`/sweep-readings/${id}`);
  }

  // Time Series Data
  async getTimeSeriesData(filters: SensorFilters & {
    window?: 'minute' | 'hour' | 'day';
    aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'count';
  }): Promise<Array<{
    timestamp: string;
    metric: string;
    value: number;
    unit: string;
    count: number;
  }>> {
    try {
      const queryString = this.buildQueryString(filters);
      const url = queryString ? `/time-series?${queryString}` : '/time-series';
      return await this.request<Array<{
        timestamp: string;
        metric: string;
        value: number;
        unit: string;
        count: number;
      }>>(url);
    } catch (error) {
      console.warn('Sensor Streamer Service unavailable:', error);
      return [];
    }
  }

  // Real-time Data (WebSocket)
  getWebSocketURL(): string {
    return this.baseURL.replace('http', 'ws') + '/ws';
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

// Create singleton instance
export const sensorStreamerClient = new SensorStreamerClient();
export default sensorStreamerClient;
