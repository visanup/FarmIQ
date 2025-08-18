// src/utils/dataSource.ts
import { DataSource } from 'typeorm';
import { DATABASE_URL, DB_SCHEMA, NODE_ENV } from '../configs/config';

// models
import { DeviceHealth } from '../models/DeviceHealth';
import { DeviceReading } from '../models/DeviceReading';
import { LabReading } from '../models/LabReading';
import { SweepReading } from '../models/SweepReading';
import { StreamState } from '../models/StreamState';  // ✅ เพิ่มบรรทัดนี้

console.log('[db.config]', { DATABASE_URL, DB_SCHEMA });

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: DATABASE_URL,
  schema: DB_SCHEMA,
  entities: [
    DeviceHealth,
    DeviceReading,
    LabReading,
    SweepReading,
    StreamState,        // 👈 เพิ่มเข้ามา
  ],
  synchronize: false,
  logging: NODE_ENV !== 'production',
});
