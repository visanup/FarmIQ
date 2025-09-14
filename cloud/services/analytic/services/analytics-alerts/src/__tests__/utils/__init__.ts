// src/__tests__/utils/__init__.ts
import { AppDataSource } from '../../utils/dataSource';

// Initialize database before all tests
beforeAll(async () => {
  await AppDataSource.initialize();
});

// Clean up after all tests
afterAll(async () => {
  await AppDataSource.destroy();
});