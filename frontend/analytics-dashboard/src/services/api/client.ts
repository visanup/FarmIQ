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
  DashboardMetrics
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
  mockAlerts,
  generateTimeSeriesData
} from './mockData';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  private clearAuth() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // Auth Service - Mock implementation
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful login
    const mockUser: User = {
      id: 'user-1',
      email: credentials.email,
      name: 'Demo User',
      role: 'ADMIN',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-20T10:30:00Z',
    };

    return {
      user: mockUser,
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      expiresIn: 3600,
    };
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful registration
    const mockUser: User = {
      id: 'user-' + Date.now(),
      email: userData.email,
      name: userData.name,
      role: 'USER',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      user: mockUser,
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      expiresIn: 3600,
    };
  }

  async getCurrentUser(): Promise<User> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock user
    return {
      id: 'user-1',
      email: 'demo@farmiq.com',
      name: 'Demo User',
      role: 'ADMIN',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-20T10:30:00Z',
    };
  }

  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      accessToken: 'mock-access-token-refreshed-' + Date.now(),
      refreshToken: 'mock-refresh-token-refreshed-' + Date.now(),
    };
  }

  async logout(): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    this.clearAuth();
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

  // Sensor Streamer Service - Mock implementation
  async getSensorReadings(filters?: {
    deviceId?: string;
    farmId?: string;
    houseId?: string;
    sensorType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<SensorReading[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    let readings = mockSensorReadings;
    
    if (filters?.deviceId) {
      readings = readings.filter(r => r.deviceId === filters.deviceId);
    }
    if (filters?.farmId) {
      readings = readings.filter(r => r.farmId === filters.farmId);
    }
    if (filters?.houseId) {
      readings = readings.filter(r => r.houseId === filters.houseId);
    }
    if (filters?.sensorType) {
      readings = readings.filter(r => r.sensorType === filters.sensorType);
    }
    if (filters?.limit) {
      readings = readings.slice(0, filters.limit);
    }
    
    return readings;
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