export interface CreateSensorReadingInput {
  deviceId: string;
  farmId?: string;
  houseId?: string;
  sensorType: string;
  value: number;
  unit: string;
  location?: { x: number; y: number; z: number };
  metadata?: Record<string, any>;
  timestamp?: string;
}

export interface SensorReadingResponse {
  id: string;
  deviceId: string;
  farmId?: string;
  houseId?: string;
  sensorType: string;
  value: number;
  unit: string;
  location?: { x: number; y: number; z: number };
  metadata?: Record<string, any>;
  timestamp: Date;
  createdAt: Date;
}
