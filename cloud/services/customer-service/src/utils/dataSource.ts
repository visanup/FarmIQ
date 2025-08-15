// services\data-service\src\utils\dataSource.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';
import {Customer,Subscription} from '../models';

// 1) โหลด .env จาก root ของโปรเจกต์
dotenv.config({ path: join(__dirname, '../../.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT  || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  schema:   'customers',
  entities: [Customer,Subscription],
  synchronize: false, // true only during development
  logging:     false
});


