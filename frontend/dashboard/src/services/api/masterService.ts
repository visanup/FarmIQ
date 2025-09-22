// Master Service API Client
// Connects to Master Service (port 7307) for master data
import { 
  Customer, 
  Farm, 
  House, 
  Zone,
  Station,
  Flock,
  AnimalType,
  Breed,
  DeviceType,
  SensorType,
  FeedType,
  Formula,
  EconomicData,
  Device, 
  Animal,
  DeviceHealth,
  PaginatedResponse 
} from '../../types/api';
import { API_CONFIG } from '../../config/api';

class MasterServiceClient {
  private baseURL: string;

  constructor(baseURL: string = import.meta.env.VITE_MASTER_SERVICE_URL || 'http://localhost:7307/api/v1') {
    this.baseURL = baseURL;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const accessToken = localStorage.getItem('accessToken');
    const res = await fetch(`${this.baseURL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-API-Key': API_CONFIG.MASTER_SERVICE_API_KEY,
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
      throw new Error(message || `Master Service request failed with status ${res.status}`);
    }
    return (await res.json()) as T;
  }

  // Customer Management
  async getCustomers(): Promise<Customer[]> {
    const response = await this.request<PaginatedResponse<Customer>>('/customers');
    return response.data;
  }

  async getCustomer(id: string): Promise<Customer> {
    return this.request<Customer>(`/customers/${id}`);
  }

  async createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    return this.request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
    return this.request<Customer>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    });
  }

  async deleteCustomer(id: string): Promise<void> {
    await this.request(`/customers/${id}`, { method: 'DELETE' });
  }

  // Farm Management
  async getFarms(): Promise<Farm[]> {
    const response = await this.request<PaginatedResponse<Farm>>('/farms');
    return response.data;
  }

  async getFarm(id: string): Promise<Farm> {
    return this.request<Farm>(`/farms/${id}`);
  }

  async getFarmsByCustomer(customerId: string): Promise<Farm[]> {
    const response = await this.request<PaginatedResponse<Farm>>(`/farms?customerId=${customerId}`);
    return response.data;
  }

  async createFarm(farm: Omit<Farm, 'id' | 'createdAt' | 'updatedAt'>): Promise<Farm> {
    return this.request<Farm>('/farms', {
      method: 'POST',
      body: JSON.stringify(farm),
    });
  }

  async updateFarm(id: string, farm: Partial<Farm>): Promise<Farm> {
    return this.request<Farm>(`/farms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(farm),
    });
  }

  async deleteFarm(id: string): Promise<void> {
    await this.request(`/farms/${id}`, { method: 'DELETE' });
  }

  // House Management
  async getHouses(farmId?: string): Promise<House[]> {
    const url = farmId ? `/houses?farmId=${farmId}` : '/houses';
    const response = await this.request<PaginatedResponse<House>>(url);
    return response.data;
  }

  async getHouse(id: string): Promise<House> {
    return this.request<House>(`/houses/${id}`);
  }

  async createHouse(house: Omit<House, 'id' | 'createdAt' | 'updatedAt'>): Promise<House> {
    return this.request<House>('/houses', {
      method: 'POST',
      body: JSON.stringify(house),
    });
  }

  async updateHouse(id: string, house: Partial<House>): Promise<House> {
    return this.request<House>(`/houses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(house),
    });
  }

  async deleteHouse(id: string): Promise<void> {
    await this.request(`/houses/${id}`, { method: 'DELETE' });
  }

  // Zone Management
  async getZones(filters?: { farmId?: string; houseId?: string }): Promise<Zone[]> {
    const params = new URLSearchParams();
    if (filters?.farmId) params.set('farmId', filters.farmId);
    if (filters?.houseId) params.set('houseId', filters.houseId);
    
    const url = params.toString() ? `/zones?${params.toString()}` : '/zones';
    const response = await this.request<PaginatedResponse<Zone>>(url);
    return response.data;
  }

  async getZone(id: string): Promise<Zone> {
    return this.request<Zone>(`/zones/${id}`);
  }

  async createZone(zone: Omit<Zone, 'id' | 'createdAt' | 'updatedAt'>): Promise<Zone> {
    return this.request<Zone>('/zones', {
      method: 'POST',
      body: JSON.stringify(zone),
    });
  }

  async updateZone(id: string, zone: Partial<Zone>): Promise<Zone> {
    return this.request<Zone>(`/zones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(zone),
    });
  }

  async deleteZone(id: string): Promise<void> {
    await this.request(`/zones/${id}`, { method: 'DELETE' });
  }

  // Device Management
  async getDevices(filters?: { farmId?: string; houseId?: string }): Promise<Device[]> {
    const params = new URLSearchParams();
    if (filters?.farmId) params.set('farmId', filters.farmId);
    if (filters?.houseId) params.set('houseId', filters.houseId);
    
    const url = params.toString() ? `/devices?${params.toString()}` : '/devices';
    const response = await this.request<PaginatedResponse<Device>>(url);
    return response.data;
  }

  async getDevice(id: string): Promise<Device> {
    return this.request<Device>(`/devices/${id}`);
  }

  async createDevice(device: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>): Promise<Device> {
    return this.request<Device>('/devices', {
      method: 'POST',
      body: JSON.stringify(device),
    });
  }

  async updateDevice(id: string, device: Partial<Device>): Promise<Device> {
    return this.request<Device>(`/devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(device),
    });
  }

  async deleteDevice(id: string): Promise<void> {
    await this.request(`/devices/${id}`, { method: 'DELETE' });
  }

  // Animal Management
  async getAnimals(filters?: { farmId?: string; houseId?: string }): Promise<Animal[]> {
    const params = new URLSearchParams();
    if (filters?.farmId) params.set('farmId', filters.farmId);
    if (filters?.houseId) params.set('houseId', filters.houseId);
    
    const url = params.toString() ? `/animals?${params.toString()}` : '/animals';
    const response = await this.request<PaginatedResponse<Animal>>(url);
    return response.data;
  }

  async getAnimal(id: string): Promise<Animal> {
    return this.request<Animal>(`/animals/${id}`);
  }

  async createAnimal(animal: Omit<Animal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Animal> {
    return this.request<Animal>('/animals', {
      method: 'POST',
      body: JSON.stringify(animal),
    });
  }

  async updateAnimal(id: string, animal: Partial<Animal>): Promise<Animal> {
    return this.request<Animal>(`/animals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(animal),
    });
  }

  async deleteAnimal(id: string): Promise<void> {
    await this.request(`/animals/${id}`, { method: 'DELETE' });
  }

  // Station Management
  async getStations(filters?: { farmId?: string; houseId?: string; zoneId?: string }): Promise<Station[]> {
    const params = new URLSearchParams();
    if (filters?.farmId) params.set('farmId', filters.farmId);
    if (filters?.houseId) params.set('houseId', filters.houseId);
    if (filters?.zoneId) params.set('zoneId', filters.zoneId);

    const url = params.toString() ? `/stations?${params.toString()}` : '/stations';
    const response = await this.request<PaginatedResponse<Station>>(url);
    return response.data;
  }

  async getStation(id: string): Promise<Station> {
    return this.request<Station>(`/stations/${id}`);
  }

  async createStation(station: Omit<Station, 'id' | 'createdAt' | 'updatedAt'>): Promise<Station> {
    return this.request<Station>('/stations', {
      method: 'POST',
      body: JSON.stringify(station),
    });
  }

  async updateStation(id: string, station: Partial<Station>): Promise<Station> {
    return this.request<Station>(`/stations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(station),
    });
  }

  async deleteStation(id: string): Promise<void> {
    await this.request(`/stations/${id}`, { method: 'DELETE' });
  }

  // Flock Management
  async getFlocks(filters?: { farmId?: string; houseId?: string }): Promise<Flock[]> {
    const params = new URLSearchParams();
    if (filters?.farmId) params.set('farmId', filters.farmId);
    if (filters?.houseId) params.set('houseId', filters.houseId);

    const url = params.toString() ? `/flocks?${params.toString()}` : '/flocks';
    const response = await this.request<PaginatedResponse<Flock>>(url);
    return response.data;
  }

  async getFlock(id: string): Promise<Flock> {
    return this.request<Flock>(`/flocks/${id}`);
  }

  async createFlock(flock: Omit<Flock, 'id' | 'createdAt' | 'updatedAt'>): Promise<Flock> {
    return this.request<Flock>('/flocks', {
      method: 'POST',
      body: JSON.stringify(flock),
    });
  }

  async updateFlock(id: string, flock: Partial<Flock>): Promise<Flock> {
    return this.request<Flock>(`/flocks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(flock),
    });
  }

  async deleteFlock(id: string): Promise<void> {
    await this.request(`/flocks/${id}`, { method: 'DELETE' });
  }

  // Animal Type Management
  async getAnimalTypes(): Promise<AnimalType[]> {
    const response = await this.request<PaginatedResponse<AnimalType>>('/animal-types');
    return response.data;
  }

  async getAnimalType(id: string): Promise<AnimalType> {
    return this.request<AnimalType>(`/animal-types/${id}`);
  }

  async createAnimalType(animalType: Omit<AnimalType, 'id' | 'createdAt' | 'updatedAt'>): Promise<AnimalType> {
    return this.request<AnimalType>('/animal-types', {
      method: 'POST',
      body: JSON.stringify(animalType),
    });
  }

  async updateAnimalType(id: string, animalType: Partial<AnimalType>): Promise<AnimalType> {
    return this.request<AnimalType>(`/animal-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(animalType),
    });
  }

  async deleteAnimalType(id: string): Promise<void> {
    await this.request(`/animal-types/${id}`, { method: 'DELETE' });
  }

  // Breed Management
  async getBreeds(filters?: { animalTypeId?: string }): Promise<Breed[]> {
    const params = new URLSearchParams();
    if (filters?.animalTypeId) params.set('animalTypeId', filters.animalTypeId);

    const url = params.toString() ? `/breeds?${params.toString()}` : '/breeds';
    const response = await this.request<PaginatedResponse<Breed>>(url);
    return response.data;
  }

  async getBreed(id: string): Promise<Breed> {
    return this.request<Breed>(`/breeds/${id}`);
  }

  async createBreed(breed: Omit<Breed, 'id' | 'createdAt' | 'updatedAt'>): Promise<Breed> {
    return this.request<Breed>('/breeds', {
      method: 'POST',
      body: JSON.stringify(breed),
    });
  }

  async updateBreed(id: string, breed: Partial<Breed>): Promise<Breed> {
    return this.request<Breed>(`/breeds/${id}`, {
      method: 'PUT',
      body: JSON.stringify(breed),
    });
  }

  async deleteBreed(id: string): Promise<void> {
    await this.request(`/breeds/${id}`, { method: 'DELETE' });
  }

  // Device Type Management
  async getDeviceTypes(): Promise<DeviceType[]> {
    const response = await this.request<PaginatedResponse<DeviceType>>('/device-types');
    return response.data;
  }

  async getDeviceType(id: string): Promise<DeviceType> {
    return this.request<DeviceType>(`/device-types/${id}`);
  }

  async createDeviceType(deviceType: Omit<DeviceType, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeviceType> {
    return this.request<DeviceType>('/device-types', {
      method: 'POST',
      body: JSON.stringify(deviceType),
    });
  }

  async updateDeviceType(id: string, deviceType: Partial<DeviceType>): Promise<DeviceType> {
    return this.request<DeviceType>(`/device-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(deviceType),
    });
  }

  async deleteDeviceType(id: string): Promise<void> {
    await this.request(`/device-types/${id}`, { method: 'DELETE' });
  }

  // Sensor Type Management
  async getSensorTypes(): Promise<SensorType[]> {
    const response = await this.request<PaginatedResponse<SensorType>>('/sensor-types');
    return response.data;
  }

  async getSensorType(id: string): Promise<SensorType> {
    return this.request<SensorType>(`/sensor-types/${id}`);
  }

  async createSensorType(sensorType: Omit<SensorType, 'id' | 'createdAt' | 'updatedAt'>): Promise<SensorType> {
    return this.request<SensorType>('/sensor-types', {
      method: 'POST',
      body: JSON.stringify(sensorType),
    });
  }

  async updateSensorType(id: string, sensorType: Partial<SensorType>): Promise<SensorType> {
    return this.request<SensorType>(`/sensor-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sensorType),
    });
  }

  async deleteSensorType(id: string): Promise<void> {
    await this.request(`/sensor-types/${id}`, { method: 'DELETE' });
  }

  // Feed Type Management
  async getFeedTypes(): Promise<FeedType[]> {
    const response = await this.request<PaginatedResponse<FeedType>>('/feed-types');
    return response.data;
  }

  async getFeedType(id: string): Promise<FeedType> {
    return this.request<FeedType>(`/feed-types/${id}`);
  }

  async createFeedType(feedType: Omit<FeedType, 'id' | 'createdAt' | 'updatedAt'>): Promise<FeedType> {
    return this.request<FeedType>('/feed-types', {
      method: 'POST',
      body: JSON.stringify(feedType),
    });
  }

  async updateFeedType(id: string, feedType: Partial<FeedType>): Promise<FeedType> {
    return this.request<FeedType>(`/feed-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(feedType),
    });
  }

  async deleteFeedType(id: string): Promise<void> {
    await this.request(`/feed-types/${id}`, { method: 'DELETE' });
  }

  // Formula Management
  async getFormulas(filters?: { animalTypeId?: string }): Promise<Formula[]> {
    const params = new URLSearchParams();
    if (filters?.animalTypeId) params.append('animalTypeId', filters.animalTypeId);
    const queryString = params.toString();
    const url = queryString ? `/formulas?${queryString}` : '/formulas';
    const response = await this.request<PaginatedResponse<Formula>>(url);
    return response.data;
  }

  async getFormula(id: string): Promise<Formula> {
    return this.request<Formula>(`/formulas/${id}`);
  }

  async createFormula(formula: Omit<Formula, 'id' | 'createdAt' | 'updatedAt'>): Promise<Formula> {
    return this.request<Formula>('/formulas', {
      method: 'POST',
      body: JSON.stringify(formula),
    });
  }

  async updateFormula(id: string, formula: Partial<Formula>): Promise<Formula> {
    return this.request<Formula>(`/formulas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(formula),
    });
  }

  async deleteFormula(id: string): Promise<void> {
    await this.request(`/formulas/${id}`, { method: 'DELETE' });
  }

  // Economic Data Management
  async getEconomicData(filters?: { customerId?: string; farmId?: string; type?: 'income' | 'expense' }): Promise<EconomicData[]> {
    const params = new URLSearchParams();
    if (filters?.customerId) params.append('customerId', filters.customerId);
    if (filters?.farmId) params.append('farmId', filters.farmId);
    if (filters?.type) params.append('type', filters.type);
    const queryString = params.toString();
    const url = queryString ? `/economic-data?${queryString}` : '/economic-data';
    const response = await this.request<PaginatedResponse<EconomicData>>(url);
    return response.data;
  }

  async getEconomicDataById(id: string): Promise<EconomicData> {
    return this.request<EconomicData>(`/economic-data/${id}`);
  }

  async createEconomicData(economicData: Omit<EconomicData, 'id' | 'createdAt' | 'updatedAt'>): Promise<EconomicData> {
    return this.request<EconomicData>('/economic-data', {
      method: 'POST',
      body: JSON.stringify(economicData),
    });
  }

  async updateEconomicData(id: string, economicData: Partial<EconomicData>): Promise<EconomicData> {
    return this.request<EconomicData>(`/economic-data/${id}`, {
      method: 'PUT',
      body: JSON.stringify(economicData),
    });
  }

  async deleteEconomicData(id: string): Promise<void> {
    await this.request(`/economic-data/${id}`, { method: 'DELETE' });
  }

  // Device Health
  async getDeviceHealth(deviceId?: string): Promise<DeviceHealth[]> {
    const url = deviceId ? `/device-health?deviceId=${deviceId}` : '/device-health';
    const response = await this.request<PaginatedResponse<DeviceHealth>>(url);
    return response.data;
  }

  async getDeviceHealthById(id: string): Promise<DeviceHealth> {
    return this.request<DeviceHealth>(`/device-health/${id}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

// Create singleton instance
export const masterServiceClient = new MasterServiceClient();
export default masterServiceClient;
