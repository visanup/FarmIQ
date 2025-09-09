export interface CreateDataIngestionLogInput {
  source: string;
  dataType: string;
  recordCount: number;
  status: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export interface DataIngestionLogResponse {
  id: string;
  source: string;
  dataType: string;
  recordCount: number;
  status: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}
