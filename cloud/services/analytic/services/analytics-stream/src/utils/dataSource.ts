// src/utils/dataSource.ts

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from '../configs/config';
import { AnalyticsMinuteFeature } from '../models/analyticsMinuteFeature.entity';
import { Analytics5mView, Analytics1hView } from '../models/analyticsAggregates.views';
import * as path from 'path';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: env.DATABASE_URL,
  schema: env.DB_SCHEMA,
  synchronize: false,
  logging: false,
  entities: [AnalyticsMinuteFeature, Analytics5mView, Analytics1hView],
  migrations: [path.join(__dirname, '..', 'models', 'migrations', '*.{ts,js}')],
});


