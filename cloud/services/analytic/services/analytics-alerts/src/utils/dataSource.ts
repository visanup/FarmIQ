// src/utils/dataSource.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Alert } from '../models/alert.model';
import { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_SCHEMA, ENV } from '../configs/config';

// Initialize TypeORM data source
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: parseInt(DB_PORT),
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  schema: DB_SCHEMA,
  entities: [Alert],
  synchronize: false,
  logging: ENV === 'dev',
  poolSize: 20,
  maxQueryExecutionTime: 30000,
  connectTimeoutMS: 30000,
  extra: {
    max: 20,
    min: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
});