// src/utils/dataSource.ts

// src/utils/dataSource.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { DATABASE_URL, DB_SCHEMA } from '../configs/config';
import { MediaObject } from '../models/MediaObject';
import { ReadingMediaMap } from '../models/ReadingMediaMap';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: DATABASE_URL,          // ใช้ url เดียว ชัวร์สุด
  schema: DB_SCHEMA,
  entities: [MediaObject, ReadingMediaMap],
  synchronize: false,
  logging: false,
});

