// src/__tests__/utils/test.helper.ts
import { AlertService } from '../../services/alert.service';
import { AppDataSource } from '../../utils/dataSource';
import { Alert } from '../../models/alert.model';
import { getRepository } from 'typeorm';

// Initialize alert service
export const alertService = new AlertService();

// Helper function to create test alerts
export const createTestAlert = async (overrides: Partial<Alert> = {}) => {
  return await alertService.createAlert({
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
};

// Helper function to clear alerts
export const clearAlerts = async () => {
  await getRepository(Alert).clear();
};