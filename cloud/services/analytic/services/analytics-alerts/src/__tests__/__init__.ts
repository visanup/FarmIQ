// src/__tests__/__init__.ts
import { AppDataSource } from '../utils/dataSource';
import { Alert } from '../models/alert.model';
import { AlertService } from '../services/alert.service';
import { getRepository } from 'typeorm';

// Initialize database before all tests
beforeAll(async () => {
  await AppDataSource.initialize();
  // Clear alerts before each test
  await getRepository(Alert).clear();
});

// Clean up after all tests
afterAll(async () => {
  await AppDataSource.destroy();
});