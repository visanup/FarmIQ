// API Types matching backend services
import { z } from 'zod';

// Auth Service Types
export const UserRoleSchema = z.enum(['ADMIN', 'USER', 'VIEWER']);

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  role: UserRoleSchema,
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const AuthResponseSchema = z.object({
  user: UserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

// Customer Service Types
export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdById: z.string(),
});

export const PlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  currency: z.string(),
  duration: z.number(),
  features: z.record(z.any()).nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const SubscriptionSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  planId: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'CANCELLED']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdById: z.string(),
});

// Sensor Streamer Service Types
export const SensorReadingSchema = z.object({
  id: z.string(),
  deviceId: z.string(),
  farmId: z.string().nullable(),
  houseId: z.string().nullable(),
  sensorType: z.string(),
  value: z.number(),
  unit: z.string(),
  location: z.record(z.any()).nullable(),
  metadata: z.record(z.any()).nullable(),
  timestamp: z.string().datetime(),
  createdAt: z.string().datetime(),
});

export const DeviceHealthSchema = z.object({
  id: z.string(),
  deviceId: z.string(),
  status: z.enum(['ONLINE', 'OFFLINE', 'ERROR', 'MAINTENANCE']),
  lastSeen: z.string().datetime(),
  batteryLevel: z.number().nullable(),
  signalStrength: z.number().nullable(),
  temperature: z.number().nullable(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const LabReadingSchema = z.object({
  id: z.string(),
  sampleId: z.string(),
  farmId: z.string().nullable(),
  testType: z.string(),
  value: z.number(),
  unit: z.string(),
  result: z.enum(['PASS', 'FAIL', 'PENDING']).nullable(),
  metadata: z.record(z.any()).nullable(),
  timestamp: z.string().datetime(),
  createdAt: z.string().datetime(),
});

export const SweepReadingSchema = z.object({
  id: z.string(),
  deviceId: z.string(),
  farmId: z.string().nullable(),
  sweepId: z.string(),
  data: z.record(z.any()),
  metadata: z.record(z.any()).nullable(),
  timestamp: z.string().datetime(),
  createdAt: z.string().datetime(),
});

// Data Service Types
export const FarmSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string().nullable(),
  size: z.number().nullable(),
  type: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const HouseSchema = z.object({
  id: z.string(),
  farmId: z.string(),
  name: z.string(),
  type: z.string().nullable(),
  capacity: z.number().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ZoneSchema = z.object({
  id: z.string(),
  farmId: z.string(),
  houseId: z.string(),
  name: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const StationSchema = z.object({
  id: z.string(),
  farmId: z.string(),
  houseId: z.string(),
  zoneId: z.string(),
  name: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const FlockSchema = z.object({
  id: z.string(),
  farmId: z.string(),
  houseId: z.string(),
  name: z.string(),
  breed: z.string().nullable(),
  quantity: z.number().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const AnimalTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().nullable(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const BreedSchema = z.object({
  id: z.string(),
  name: z.string(),
  animalTypeId: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const DeviceTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  manufacturer: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const SensorTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  unit: z.string().nullable(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const FeedTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const FormulaSchema = z.object({
  id: z.string(),
  name: z.string(),
  animalTypeId: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const EconomicDataSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  farmId: z.string(),
  category: z.string(),
  amount: z.number(),
  budget: z.number().nullable(),
  type: z.enum(['income', 'expense']),
  description: z.string().nullable(),
  date: z.string().datetime(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const AnimalSchema = z.object({
  id: z.string(),
  farmId: z.string(),
  houseId: z.string().nullable(),
  tagNumber: z.string(),
  breed: z.string().nullable(),
  birthDate: z.string().datetime().nullable(),
  gender: z.string().nullable(),
  weight: z.number().nullable(),
  status: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const DeviceSchema = z.object({
  id: z.string(),
  farmId: z.string(),
  houseId: z.string().nullable(),
  deviceTypeId: z.string(),
  serialNumber: z.string(),
  name: z.string().nullable(),
  location: z.record(z.any()).nullable(),
  isActive: z.boolean(),
  lastSeen: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const PerformanceMetricSchema = z.object({
  id: z.string(),
  animalId: z.string().nullable(),
  farmId: z.string(),
  metric: z.string(),
  value: z.number(),
  unit: z.string().nullable(),
  date: z.string().datetime(),
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const HealthRecordSchema = z.object({
  id: z.string(),
  animalId: z.string(),
  farmId: z.string(),
  type: z.string(),
  description: z.string().nullable(),
  date: z.string().datetime(),
  veterinarian: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Common API Response Types
export const PaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
});

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
    error: z.string().optional(),
  });

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  });

// Type exports
export type User = z.infer<typeof UserSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export type Customer = z.infer<typeof CustomerSchema>;
export type Plan = z.infer<typeof PlanSchema>;
export type Subscription = z.infer<typeof SubscriptionSchema>;

export type SensorReading = z.infer<typeof SensorReadingSchema>;
export type DeviceHealth = z.infer<typeof DeviceHealthSchema>;
export type LabReading = z.infer<typeof LabReadingSchema>;
export type SweepReading = z.infer<typeof SweepReadingSchema>;

export type Farm = z.infer<typeof FarmSchema>;
export type House = z.infer<typeof HouseSchema>;
export type Zone = z.infer<typeof ZoneSchema>;
export type Station = z.infer<typeof StationSchema>;
export type Flock = z.infer<typeof FlockSchema>;
export type AnimalType = z.infer<typeof AnimalTypeSchema>;
export type Breed = z.infer<typeof BreedSchema>;
export type DeviceType = z.infer<typeof DeviceTypeSchema>;
export type SensorType = z.infer<typeof SensorTypeSchema>;
export type FeedType = z.infer<typeof FeedTypeSchema>;
export type Formula = z.infer<typeof FormulaSchema>;
export type EconomicData = z.infer<typeof EconomicDataSchema>;
export type Animal = z.infer<typeof AnimalSchema>;
export type Device = z.infer<typeof DeviceSchema>;
export type PerformanceMetric = z.infer<typeof PerformanceMetricSchema>;
export type HealthRecord = z.infer<typeof HealthRecordSchema>;

export type Pagination = z.infer<typeof PaginationSchema>;
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
};
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

// Dashboard specific types
export interface DashboardFilters {
  customerId?: string;
  farmId?: string;
  houseId?: string;
  deviceId?: string;
  dateRange: {
    start: string;
    end: string;
  };
  level: 'overview' | 'farm' | 'house' | 'device';
}

export interface DashboardMetrics {
  totalFarms: number;
  totalAnimals: number;
  totalDevices: number;
  onlineDevices: number;
  alerts: number;
  criticalAlerts: number;
  lastUpdate: string;
}

export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface TimeSeriesData {
  metric: string;
  unit: string;
  data: ChartDataPoint[];
  color?: string;
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  deviceId?: string;
  farmId?: string;
  acknowledged: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

