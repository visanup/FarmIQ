// services\data-service\src\utils\dataSource.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';
import {
  Farm,
  House,
  Animal,
  GeneticFactor,
  FeedProgram,
  FeedIntake,
  EnvironmentalFactor,
  HousingCondition,
  WaterQuality,
  HealthRecord,
  WelfareIndicator,
  PerformanceMetric,
  OperationRecord
} from '../models';

// 1) โหลด .env จาก root ของโปรเจกต์
dotenv.config({ path: join(__dirname, '../../.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT  || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  schema:   'farms',
  entities: [
    Farm,
    House,
    Animal,
    GeneticFactor,
    FeedProgram,
    FeedIntake,
    EnvironmentalFactor,
    HousingCondition,
    WaterQuality,
    HealthRecord,
    WelfareIndicator,
    PerformanceMetric,
    OperationRecord
  ],
  synchronize: false, // true only during development
  logging:     false
});


