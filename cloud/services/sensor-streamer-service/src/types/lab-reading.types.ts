export interface CreateLabReadingInput {
  sampleId: string;
  farmId?: string;
  testType: string;
  value: number;
  unit: string;
  result?: 'PASS' | 'FAIL' | 'PENDING';
  metadata?: Record<string, any>;
  timestamp?: string;
}

export interface LabReadingResponse {
  id: string;
  sampleId: string;
  farmId?: string;
  testType: string;
  value: number;
  unit: string;
  result?: 'PASS' | 'FAIL' | 'PENDING';
  metadata?: Record<string, any>;
  timestamp: Date;
  createdAt: Date;
}
