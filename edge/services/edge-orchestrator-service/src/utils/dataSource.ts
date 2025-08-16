// src/utils/dataSource.ts

import { DataSource } from 'typeorm';
import { DATABASE_URL } from '../configs/config';
import { MediaObject } from '../models/MediaObject';
import { WeightMapping } from '../models/WeightMapping';
import { ModelRegistry } from '../models/ModelRegistry';
import { DatasetExport } from '../models/DatasetExport';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: DATABASE_URL,
  entities: [MediaObject, WeightMapping, ModelRegistry, DatasetExport],
  synchronize: false,     // ใช้ migration จริงในโปรดักชัน
  logging: false
});


