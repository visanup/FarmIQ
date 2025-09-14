export interface CreateSensorAlertInput {
  deviceId: string;
  farmId?: string;
  houseId?: string;
  alertType: string;
  severity: string;
  message: string;
  value: number;
  threshold: number;
  isResolved?: boolean;
  resolvedAt?: string;
  metadata?: any;
}

export interface UpdateSensorAlertInput {
  isResolved?: boolean;
  resolvedAt?: string;
  message?: string;
  metadata?: any;
}

export interface SensorAlertResponse {
  id: string;
  deviceId: string;
  farmId?: string;
  houseId?: string;
  alertType: string;
  severity: string;
  message: string;
  value: number;
  threshold: number;
  isResolved: boolean;
  resolvedAt?: Date;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}
