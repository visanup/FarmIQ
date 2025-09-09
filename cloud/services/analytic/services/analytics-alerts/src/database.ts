// src/database.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Alert } from './models/alert.model';
import { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_SCHEMA } from './configs/config';

// Initialize TypeORM data source
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: parseInt(DB_PORT as string),
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  schema: DB_SCHEMA,
  entities: [Alert],
  synchronize: false,
  logging: false
});