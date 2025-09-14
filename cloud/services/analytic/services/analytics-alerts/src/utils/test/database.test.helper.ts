// src/utils/test/database.test.helper.ts
import { AppDataSource } from '../dataSource';
import { Alert } from '../../models/alert.model';
import { getRepository } from 'typeorm';

// Helper function to get alerts
export const getAlerts = async () => {
  return await getRepository(Alert).find();
};

// Helper function to clear alerts
export const clearAlerts = async () => {
  await getRepository(Alert).clear();
};

// Helper function to create test alerts
export const createTestAlert = async (overrides: Partial<Alert> = {}) => {
  const alert = getRepository(Alert).create({
    type: 'test_alert',
    message: 'Test alert message',
    tenant_id: 'test_tenant',
    factory_id: 'test_factory',
    device_id: 'test_device',
    metric: 'test_metric',
    value: 100,
    alert_time: new Date(),
    severity: 'medium',
    alert_type: 'test',
    ...overrides
  });
  
  return await getRepository(Alert).save(alert);
};