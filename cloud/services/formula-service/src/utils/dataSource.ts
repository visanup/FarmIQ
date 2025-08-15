// services/formula-service/src/utils/dataSource.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

import {
  Formula,
  FormulaComposition,
  FormulaEnergy,
  FormulaNutrition,
  FormulaAdditional,
} from '../models';

// โหลด .env จาก root ของโปรเจกต์
dotenv.config({ path: join(__dirname, '../../.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  schema: 'formulas',
  entities: [
    Formula,
    FormulaComposition,
    FormulaEnergy,
    FormulaNutrition,
    FormulaAdditional,
  ],
  synchronize: false, // ตั้ง true เฉพาะตอน dev เท่านั้น
  logging: false,
});



