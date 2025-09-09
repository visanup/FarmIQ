export interface CreateSweepReadingInput {
  deviceId: string;
  farmId?: string;
  sweepId: string;
  data: Record<string, any>;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export interface SweepReadingResponse {
  id: string;
  deviceId: string;
  farmId?: string;
  sweepId: string;
  data: Record<string, any>;
  metadata?: Record<string, any>;
  timestamp: Date;
  createdAt: Date;
}
