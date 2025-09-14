import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Customer,
  Farm,
  Animal,
  Device,
  SensorReading,
  DeviceHealth,
  PerformanceMetric,
  HealthRecord,
  DashboardFilters,
  DashboardMetrics,
} from '../../types/api';
import {
  mockFarms,
  mockAnimals,
  mockDevices,
  mockSensorReadings,
  mockDeviceHealth,
  mockPerformanceMetrics,
  mockHealthRecords,
  mockCustomers,
  mockDashboardMetrics,
  mockDashboardSummary,
} from './mockData';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7300/api') {
    this.baseURL = baseURL;
  }

  private clearAuth() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  private async request<T>(path: string, init?: RequestInit, retryOn401 = true): Promise<T> {
    const accessToken = localStorage.getItem('accessToken');
    const res = await fetch(`${this.baseURL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(init?.headers || {}),
      },
      credentials: 'include',
    });

    if (res.status === 401 && retryOn401) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        return this.request<T>(path, init, false);
      }
    }

    if (!res.ok) {
      // Read body ONCE, then try to parse JSON for better error messages
      const raw = await res.text();
      let message: string | undefined;
      try {
        const data = raw ? JSON.parse(raw) : undefined;
        message = data?.message || data?.error;
      } catch {
        // ignore JSON parse errors, fall back to raw text
        message = raw;
      }
      throw new Error(message || `Request failed with status ${res.status}`);
    }
    return (await res.json()) as T;
  }

  private async tryRefreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;
    try {
      const data = await this.request<{ accessToken: string; refreshToken: string; expiresIn?: number }>(
        '/auth/refresh',
        {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        },
        false
      );
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return true;
    } catch {
      this.clearAuth();
      return false;
    }
  }

  // Auth Service - Real implementation
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const result = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return result;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const result = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return result;
  }

  async getCurrentUser(): Promise<User> {
    const result = await this.request<{ user: User }>('/auth/me', { method: 'GET' });
    return result.user;
  }

  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const result = await this.request<{ accessToken: string; refreshToken: string; expiresIn?: number }>(
      '/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken: token }),
      }
    );
    return { accessToken: result.accessToken, refreshToken: result.refreshToken };
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) {
        await this.request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      }
    } finally {
      this.clearAuth();
    }
  }

  // Customer Service - Mock implementation
  async getCustomers(): Promise<Customer[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCustomers;
  }

  async getCustomer(id: string): Promise<Customer> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const customer = mockCustomers.find(c => c.id === id);
    if (!customer) throw new Error('Customer not found');
    return customer;
  }

  async createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newCustomer: Customer = {
      ...customer,
      id: 'customer-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockCustomers.push(newCustomer);
    return newCustomer;
  }

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = mockCustomers.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Customer not found');
    mockCustomers[index] = { ...mockCustomers[index], ...customer, updatedAt: new Date().toISOString() };
    return mockCustomers[index];
  }

  async deleteCustomer(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockCustomers.findIndex(c => c.id === id);
    if (index !== -1) {
      mockCustomers.splice(index, 1);
    }
  }

  // Data Service - Farms - Mock implementation
  async getFarms(): Promise<Farm[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockFarms;
  }

  async getFarm(id: string): Promise<Farm> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const farm = mockFarms.find(f => f.id === id);
    if (!farm) throw new Error('Farm not found');
    return farm;
  }

  // Data Service - Animals - Mock implementation
  async getAnimals(filters?: { farmId?: string; houseId?: string }): Promise<Animal[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    let animals = mockAnimals;
    if (filters?.farmId) {
      animals = animals.filter(a => a.farmId === filters.farmId);
    }
    if (filters?.houseId) {
      animals = animals.filter(a => a.houseId === filters.houseId);
    }
    return animals;
  }

  async getAnimal(id: string): Promise<Animal> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const animal = mockAnimals.find(a => a.id === id);
    if (!animal) throw new Error('Animal not found');
    return animal;
  }

  // Data Service - Devices - Mock implementation
  async getDevices(filters?: { farmId?: string; houseId?: string }): Promise<Device[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    let devices = mockDevices;
    if (filters?.farmId) {
      devices = devices.filter(d => d.farmId === filters.farmId);
    }
    if (filters?.houseId) {
      devices = devices.filter(d => d.houseId === filters.houseId);
    }
    return devices;
  }

  async getDevice(id: string): Promise<Device> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const device = mockDevices.find(d => d.id === id);
    if (!device) throw new Error('Device not found');
    return device;
  }

  // Sensor Streamer Service - Real implementation with graceful fallback
  async getSensorReadings(filters?: {
    deviceId?: string;
    farmId?: string;
    houseId?: string;
    sensorType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    // Non-API option keys will be ignored at request building time
    refetchIntervalMs?: number;
  }): Promise<SensorReading[]> {
    const sensorStreamerBase = (import.meta as any)?.env?.VITE_SENSOR_STREAMER_URL || 'http://localhost:7302';
    try {
      // Build query for sensor-streamer service
      const q = new URLSearchParams();
      if (filters?.deviceId) q.set('deviceId', filters.deviceId);
      if (filters?.sensorType && filters.sensorType !== 'all') q.set('sensorType', filters.sensorType);
      if (filters?.startDate) q.set('startDate', filters.startDate);
      if (filters?.endDate) q.set('endDate', filters.endDate);
      if (filters?.limit) q.set('limit', String(filters.limit));
      // Page defaults to 1
      q.set('page', '1');

      const res = await fetch(`${sensorStreamerBase}/api/sensor-readings?${q.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
      });

      if (!res.ok) {
        // Try to read error for clearer message
        const raw = await res.text();
        throw new Error(raw || `Sensor Streamer ${res.status}`);
      }

      const data = await res.json();
      // API returns a paginated object: { readings: SensorReading[], total, page, limit }
      let readings: SensorReading[] = Array.isArray(data) ? data : (data.readings || []);

      // Apply client-side filtering for farm/house if provided (API may not support these directly)
      if (filters?.farmId) {
        readings = readings.filter(r => r.farmId === filters.farmId);
      }
      if (filters?.houseId) {
        readings = readings.filter(r => r.houseId === filters.houseId);
      }

      return readings;
    } catch (error) {
      // Fallback to mock data to keep UI usable in dev or offline scenarios
      await new Promise(resolve => setTimeout(resolve, 300));
      let readings = mockSensorReadings;
      if (filters?.deviceId) readings = readings.filter(r => r.deviceId === filters.deviceId);
      if (filters?.farmId) readings = readings.filter(r => r.farmId === filters.farmId);
      if (filters?.houseId) readings = readings.filter(r => r.houseId === filters.houseId);
      if (filters?.sensorType && filters.sensorType !== 'all') readings = readings.filter(r => r.sensorType === filters.sensorType);
      if (filters?.startDate) readings = readings.filter(r => new Date(r.timestamp) >= new Date(filters.startDate!));
      if (filters?.endDate) readings = readings.filter(r => new Date(r.timestamp) <= new Date(filters.endDate!));
      if (filters?.limit) readings = readings.slice(0, filters.limit);
      return readings;
    }
  }

  // Device Health - Mock implementation
  async getDeviceHealth(filters?: { deviceId?: string }): Promise<DeviceHealth[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    let health = mockDeviceHealth;
    if (filters?.deviceId) {
      health = health.filter(h => h.deviceId === filters.deviceId);
    }
    return health;
  }

  async getOfflineDevices(thresholdMinutes?: number): Promise<DeviceHealth[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockDeviceHealth.filter(h => h.status === 'OFFLINE');
  }

  // Performance Metrics - Mock implementation
  async getPerformanceMetrics(filters?: {
    farmId?: string;
    animalId?: string;
    metric?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PerformanceMetric[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    let metrics = mockPerformanceMetrics;
    
    if (filters?.farmId) {
      metrics = metrics.filter(m => m.farmId === filters.farmId);
    }
    if (filters?.animalId) {
      metrics = metrics.filter(m => m.animalId === filters.animalId);
    }
    if (filters?.metric) {
      metrics = metrics.filter(m => m.metric === filters.metric);
    }
    
    return metrics;
  }

  // Health Records - Mock implementation
  async getHealthRecords(filters?: {
    farmId?: string;
    animalId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<HealthRecord[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    let records = mockHealthRecords;
    
    if (filters?.farmId) {
      records = records.filter(r => r.farmId === filters.farmId);
    }
    if (filters?.animalId) {
      records = records.filter(r => r.animalId === filters.animalId);
    }
    if (filters?.type) {
      records = records.filter(r => r.type === filters.type);
    }
    
    return records;
  }

  // Dashboard specific methods - Mock implementation
  async getDashboardMetrics(filters: DashboardFilters): Promise<DashboardMetrics> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockDashboardMetrics;
  }

  async getDashboardSummary(): Promise<{
    totalDevices: number;
    onlineDevices: number;
    totalAlerts: number;
    criticalAlerts: number;
    lastUpdate: string;
  }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockDashboardSummary;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }

  // WebSocket connection for real-time updates
  getWebSocketURL(): string {
    return this.baseURL.replace('http', 'ws') + '/ws';
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
export default apiClient;