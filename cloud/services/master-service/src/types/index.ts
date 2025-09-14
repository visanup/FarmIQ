import { 
  Customer, 
  Farm, 
  House, 
  Device, 
  AnimalType, 
  Breed, 
  Flock,
  DeviceType,
  SensorType,
  FeedType,
  Formula,
  EconomicData,
  ExternalDataSource,
  Zone,
  Station,
  DeviceHealth,
  MasterEvent
} from '@prisma/client';

// Re-export Prisma types
export type {
  Customer,
  Farm,
  House,
  Device,
  AnimalType,
  Breed,
  Flock,
  DeviceType,
  SensorType,
  FeedType,
  Formula,
  EconomicData,
  ExternalDataSource,
  Zone,
  Station,
  DeviceHealth,
  MasterEvent
};

// Extended types with relations
export interface CustomerWithFarms extends Customer {
  farms: Farm[];
}

export interface FarmWithDetails extends Farm {
  customer: Customer;
  houses: House[];
  flocks: Flock[];
}

export interface HouseWithDetails extends House {
  farm: Farm;
  devices: Device[];
  flocks: Flock[];
}

export interface DeviceWithDetails extends Device {
  house: House;
}

export interface FlockWithDetails extends Flock {
  farm: Farm;
  house?: House;
  animalType: AnimalType;
  breed: Breed;
}

export interface BreedWithAnimalType extends Breed {
  animalType: AnimalType;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request types
export interface CreateCustomerRequest {
  tenantId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  meta?: Record<string, any>;
}

export interface CreateFarmRequest {
  farmId: string;
  tenantId: string;
  customerId: string;
  name: string;
  location?: {
    lat: number;
    lon: number;
    address?: string;
  };
  region?: string;
  farmType?: string;
  totalArea?: number;
  meta?: Record<string, any>;
}

export interface CreateHouseRequest {
  houseId: string;
  tenantId: string;
  farmId: string;
  name: string;
  type?: string;
  capacity?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  ventilation?: string;
  heating?: string;
  meta?: Record<string, any>;
}

export interface CreateDeviceRequest {
  deviceId: string;
  tenantId: string;
  farmId: string;
  houseId: string;
  name: string;
  type: string;
  model?: string;
  vendor?: string;
  serialNo?: string;
  status?: string;
  location?: {
    x: number;
    y: number;
    z: number;
  };
  meta?: Record<string, any>;
}

export interface CreateAnimalTypeRequest {
  name: string;
  category?: string;
  description?: string;
  meta?: Record<string, any>;
}

export interface CreateBreedRequest {
  animalTypeId: string;
  name: string;
  code?: string;
  description?: string;
  characteristics?: Record<string, any>;
  meta?: Record<string, any>;
}

export interface CreateFlockRequest {
  flockId: string;
  tenantId: string;
  farmId: string;
  houseId?: string;
  animalTypeId: string;
  breedId: string;
  name: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  population: number;
  sex?: string;
  sourceFarm?: string;
  vaccinationStatus?: string;
  feedType?: string;
  healthStatus?: string;
  status?: string;
  meta?: Record<string, any>;
}

// Kafka Event types
export interface KafkaEvent {
  eventId: string;
  eventType: string;
  version: string;
  timestamp: string;
  source: {
    service: string;
    version: string;
  };
  data: Record<string, any>;
}

export interface CustomerSnapshotEvent extends KafkaEvent {
  eventType: 'customer.snapshot.created' | 'customer.snapshot.updated';
  data: {
    tenant_id: string;
    customer_id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    meta?: Record<string, any>;
    updated_at: string;
  };
}

export interface FarmSnapshotEvent extends KafkaEvent {
  eventType: 'farm.snapshot.created' | 'farm.snapshot.updated';
  data: {
    tenant_id: string;
    farm_id: string;
    customer_id: string;
    name: string;
    location?: {
      lat: number;
      lon: number;
      address?: string;
    };
    region?: string;
    farm_type?: string;
    total_area?: number;
    meta?: Record<string, any>;
    updated_at: string;
  };
}

export interface DeviceSnapshotEvent extends KafkaEvent {
  eventType: 'device.snapshot.created' | 'device.snapshot.updated';
  data: {
    tenant_id: string;
    device_id: string;
    farm_id: string;
    house_id: string;
    type: string;
    status: string;
    name: string;
    model?: string;
    vendor?: string;
    serial_no?: string;
    location?: {
      x: number;
      y: number;
      z: number;
    };
    meta?: Record<string, any>;
    updated_at: string;
  };
}

export interface FlockSnapshotEvent extends KafkaEvent {
  eventType: 'flock.snapshot.created' | 'flock.snapshot.updated';
  data: {
    tenant_id: string;
    flock_id: string;
    farm_id: string;
    house_id?: string;
    animal_type_id: string;
    breed_id: string;
    name: string;
    start_date: string;
    end_date?: string;
    population: number;
    sex?: string;
    source_farm?: string;
    vaccination_status?: string;
    feed_type?: string;
    health_status?: string;
    status: string;
    meta?: Record<string, any>;
    updated_at: string;
  };
}
