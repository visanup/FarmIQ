import { z } from 'zod';

// Sensor Reading schemas
export const CreateSensorReadingSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  farmId: z.string().optional(),
  houseId: z.string().optional(),
  sensorType: z.string().min(1, 'Sensor type is required'),
  value: z.number(),
  unit: z.string().min(1, 'Unit is required'),
  location: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }).optional(),
  metadata: z.record(z.any()).optional(),
  timestamp: z.string().datetime().optional(),
});

export const SensorReadingResponseSchema = z.object({
  id: z.string(),
  deviceId: z.string(),
  farmId: z.string().nullable(),
  houseId: z.string().nullable(),
  sensorType: z.string(),
  value: z.number(),
  unit: z.string(),
  location: z.record(z.any()).nullable(),
  metadata: z.record(z.any()).nullable(),
  timestamp: z.date(),
  createdAt: z.date(),
});

// Device Health schemas
export const CreateDeviceHealthSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  status: z.enum(['ONLINE', 'OFFLINE', 'ERROR', 'MAINTENANCE']),
  lastSeen: z.string().datetime(),
  batteryLevel: z.number().min(0).max(100).optional(),
  signalStrength: z.number().optional(),
  temperature: z.number().optional(),
  errors: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
});

export const UpdateDeviceHealthSchema = z.object({
  status: z.enum(['ONLINE', 'OFFLINE', 'ERROR', 'MAINTENANCE']).optional(),
  lastSeen: z.string().datetime().optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
  signalStrength: z.number().optional(),
  temperature: z.number().optional(),
  errors: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
});

export const DeviceHealthResponseSchema = z.object({
  id: z.string(),
  deviceId: z.string(),
  status: z.enum(['ONLINE', 'OFFLINE', 'ERROR', 'MAINTENANCE']),
  lastSeen: z.date(),
  batteryLevel: z.number().nullable(),
  signalStrength: z.number().nullable(),
  temperature: z.number().nullable(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Lab Reading schemas
export const CreateLabReadingSchema = z.object({
  sampleId: z.string().min(1, 'Sample ID is required'),
  farmId: z.string().optional(),
  testType: z.string().min(1, 'Test type is required'),
  value: z.number(),
  unit: z.string().min(1, 'Unit is required'),
  result: z.enum(['PASS', 'FAIL', 'PENDING']).optional(),
  metadata: z.record(z.any()).optional(),
  timestamp: z.string().datetime().optional(),
});

export const LabReadingResponseSchema = z.object({
  id: z.string(),
  sampleId: z.string(),
  farmId: z.string().nullable(),
  testType: z.string(),
  value: z.number(),
  unit: z.string(),
  result: z.enum(['PASS', 'FAIL', 'PENDING']).nullable(),
  metadata: z.record(z.any()).nullable(),
  timestamp: z.date(),
  createdAt: z.date(),
});

// Sweep Reading schemas
export const CreateSweepReadingSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  farmId: z.string().optional(),
  sweepId: z.string().min(1, 'Sweep ID is required'),
  data: z.record(z.any()),
  metadata: z.record(z.any()).optional(),
  timestamp: z.string().datetime().optional(),
});

export const SweepReadingResponseSchema = z.object({
  id: z.string(),
  deviceId: z.string(),
  farmId: z.string().nullable(),
  sweepId: z.string(),
  data: z.record(z.any()),
  metadata: z.record(z.any()).nullable(),
  timestamp: z.date(),
  createdAt: z.date(),
});

// Data Ingestion Log schemas
export const CreateDataIngestionLogSchema = z.object({
  source: z.string().min(1, 'Source is required'),
  dataType: z.string().min(1, 'Data type is required'),
  recordCount: z.number().int().positive('Record count must be positive'),
  status: z.enum(['success', 'error', 'partial']),
  errorMessage: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const DataIngestionLogResponseSchema = z.object({
  id: z.string(),
  source: z.string(),
  dataType: z.string(),
  recordCount: z.number(),
  status: z.enum(['success', 'error', 'partial']),
  errorMessage: z.string().nullable(),
  metadata: z.record(z.any()).nullable(),
  timestamp: z.date(),
});

// Pagination schemas
export const PaginationQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  search: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Type exports
export type CreateSensorReadingInput = z.infer<typeof CreateSensorReadingSchema>;
export type SensorReadingResponse = z.infer<typeof SensorReadingResponseSchema>;
export type CreateDeviceHealthInput = z.infer<typeof CreateDeviceHealthSchema>;
export type UpdateDeviceHealthInput = z.infer<typeof UpdateDeviceHealthSchema>;
export type DeviceHealthResponse = z.infer<typeof DeviceHealthResponseSchema>;
export type CreateLabReadingInput = z.infer<typeof CreateLabReadingSchema>;
export type LabReadingResponse = z.infer<typeof LabReadingResponseSchema>;
export type CreateSweepReadingInput = z.infer<typeof CreateSweepReadingSchema>;
export type SweepReadingResponse = z.infer<typeof SweepReadingResponseSchema>;
export type CreateDataIngestionLogInput = z.infer<typeof CreateDataIngestionLogSchema>;
export type DataIngestionLogResponse = z.infer<typeof DataIngestionLogResponseSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

