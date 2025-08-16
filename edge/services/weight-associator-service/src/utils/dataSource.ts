// src/utils/dataSource.ts

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { DATABASE_URL, DB_SCHEMA } from '../configs/config';
import { MediaObject } from '../models/MediaObject';
import { Reading } from '../models/Reading';
import { ReadingMediaMap } from '../models/ReadingMediaMap';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: DATABASE_URL,
  schema: DB_SCHEMA,
  entities: [MediaObject, Reading, ReadingMediaMap],
  synchronize: false,
  logging: false,
});


