// src/utils/dataSource.ts
// src/utils/dataSource.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { DATABASE_URL } from '../configs/config';
import {Customer, Contact, CustomerUser, PlanCatalog, Subscription} from '../models';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: DATABASE_URL,
  schema: 'customers',
  entities: [Customer, Contact, CustomerUser, PlanCatalog, Subscription],
  synchronize: false, // ใช้ migration จัดการ schema/partial index
  logging: false,
});