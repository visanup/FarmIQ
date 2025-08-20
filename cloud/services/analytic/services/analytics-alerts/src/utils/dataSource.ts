// services/economic-service/src/utils/dataSource.ts

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { EconomicData } from '../models/economicData.model';

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
  entities: [EconomicData],
  synchronize: false,
  logging: false,
});


