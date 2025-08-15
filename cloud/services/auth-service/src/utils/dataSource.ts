// services/auth-service/src/utils/dataSource.ts

import { DataSource } from 'typeorm';
import { User } from '../models/user.model';
import { RefreshToken } from '../models/refreshToken.model';
import * as dotenv from 'dotenv';
import { join } from 'path';

// 1) โหลด .env จาก root ของโปรเจกต์
dotenv.config({ path: join(__dirname, '../../.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  schema: 'auth',
  entities: [User, RefreshToken],
  synchronize: false, // หรือ true แค่ dev
});
