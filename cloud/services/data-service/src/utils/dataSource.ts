// services\data-service\src\utils\dataSource.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';
import {
  Customer,
  Subscription,
  Farm,
  House,
  DeviceGroup,
  DeviceType,
  Device,
  DeviceLog,
  DeviceStatusHistory,
  Animal,
  GeneticFactor,
  FeedBatch,
  FeedBatchAssignment,
  FeedProgram,
  FeedIntake,
  FeedComposition,
  EnvironmentalFactor,
  HousingCondition,
  WaterQuality,
  HealthRecord,
  WelfareIndicator,
  PerformanceMetric,
  OperationRecord,
  EconomicData,
  ExternalFactor,
  SensorData
} from '../models';

// 1) โหลด .env จาก root ของโปรเจกต์
dotenv.config({ path: join(__dirname, '../../../../.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT  || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  schema:   'smart_farming',
  entities: [
    Customer,
    Subscription,
    Farm,
    House,
    DeviceGroup,
    DeviceType,
    Device,
    DeviceLog,
    DeviceStatusHistory,
    Animal,
    GeneticFactor,
    FeedBatch,
    FeedBatchAssignment,
    FeedProgram,
    FeedIntake,
    FeedComposition,
    EnvironmentalFactor,
    HousingCondition,
    WaterQuality,
    HealthRecord,
    WelfareIndicator,
    PerformanceMetric,
    OperationRecord,
    EconomicData,
    ExternalFactor,
    SensorData
  ],
  synchronize: false, // true only during development
  logging:     false
});


