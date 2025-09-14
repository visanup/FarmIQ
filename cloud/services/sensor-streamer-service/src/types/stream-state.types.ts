export interface CreateStreamStateInput {
  deviceId: string;
  streamType: string;
  isActive?: boolean;
  lastProcessedAt?: string;
  lastError?: string;
  retryCount?: number;
  config?: any;
}

export interface UpdateStreamStateInput {
  isActive?: boolean;
  lastProcessedAt?: string;
  lastError?: string;
  retryCount?: number;
  config?: any;
}

export interface StreamStateResponse {
  id: string;
  deviceId: string;
  streamType: string;
  isActive: boolean;
  lastProcessedAt?: Date;
  lastError?: string;
  retryCount: number;
  config?: any;
  createdAt: Date;
  updatedAt: Date;
}
