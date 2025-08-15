// feed-service/src/utils/dataSource.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { FeedBatchAssignment } from '../models/feedBatchAssignments.model';
import * as dotenv from 'dotenv';
import { join } from 'path';
import {
  FeedBatch,
  PhysicalQuality,
  ChemicalQuality,
  PelletMillCondition,
  MixingCondition,
  GrindingCondition,
} from '../models';

dotenv.config({ path: join(__dirname, '../../.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  schema: 'feeds',
  entities: [
    FeedBatch,
    PhysicalQuality,
    ChemicalQuality,
    PelletMillCondition,
    MixingCondition,
    GrindingCondition,
    FeedBatchAssignment,    // ← เพิ่มตรงนี้
  ],
  synchronize: false,
  logging: false,
});



