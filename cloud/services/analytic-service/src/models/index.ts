// services/economic-service/src/utils/dataSource.ts

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Import analytics entities
import { TsEvent } from '../models/TsEvent.model';
import { FeatureStore } from '../models/FeatureStore.model';
import { ModelResult } from '../models/ModelResult.model';
import { DataQualityLog } from '../models/DataQualityLog.model';
import { PipelineMetadata } from '../models/PipelineMetadata.model';

// load .env from project root
dotenv.config({ path: join(__dirname, '../../.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  schema: 'economics',
  entities: [
    EconomicData,
    TsEvent,
    FeatureStore,
    ModelResult,
    DataQualityLog,
    PipelineMetadata,
  ],
  synchronize: false,
  logging: false,
});
