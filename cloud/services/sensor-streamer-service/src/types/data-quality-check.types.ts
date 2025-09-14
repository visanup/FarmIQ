export interface CreateDataQualityCheckInput {
  deviceId: string;
  checkType: string;
  status: string;
  message: string;
  value: number;
  expectedMin: number;
  expectedMax: number;
  metadata?: any;
}

export interface DataQualityCheckResponse {
  id: string;
  deviceId: string;
  checkType: string;
  status: string;
  message: string;
  value: number;
  expectedMin: number;
  expectedMax: number;
  metadata?: any;
  createdAt: Date;
}
