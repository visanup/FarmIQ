// src/__tests__/alert.service.test.ts
import { AlertService } from '../services/alert.service';
import { AppDataSource } from '../utils/dataSource';
import { Alert } from '../models/alert.model';
import { getRepository } from 'typeorm';
import { registerAlertRule, handleAnalyticsFeature } from '../pipelines/registry';

describe('AlertService', () => {
  let alertService: AlertService;
  
  beforeAll(async () => {
    // Initialize database
    await AppDataSource.initialize();
    
    // Initialize alert service
    alertService = new AlertService();
    
    // Clear alerts before each test
    await getRepository(Alert).clear();
  });
  
  afterAll(async () => {
    // Close database connection
    await AppDataSource.destroy();
  });
  
  test('should create a new alert', async () => {
    const alertData = {
      type: 'test_alert',
      message: 'Test alert message',
      tenant_id: 'test_tenant',
      factory_id: 'test_factory',
      device_id: 'test_device',
      metric: 'test_metric',
      value: 100,
      alert_time: new Date().toISOString(),
      severity: 'medium',
      alert_type: 'test'
    };
    
    const alert = await alertService.createAlert(alertData);
    
    expect(alert).toBeDefined();
    expect(alert.id).toBeDefined();
    expect(alert.type).toBe(alertData.type);
    expect(alert.message).toBe(alertData.message);
    expect(alert.tenant_id).toBe(alertData.tenant_id);
    expect(alert.factory_id).toBe(alertData.factory_id);
    expect(alert.device_id).toBe(alertData.device_id);
    expect(alert.metric).toBe(alertData.metric);
    expect(alert.value).toBe(alertData.value);
    expect(alert.severity).toBe(alertData.severity);
    expect(alert.alert_type).toBe(alertData.alert_type);
  });
  
  test('should get all alerts', async () => {
    // Create test alerts
    const alert1 = await alertService.createAlert({
      type: 'test_alert_1',
      message: 'Test alert message 1',
      tenant_id: 'test_tenant',
      factory_id: 'test_factory',
      device_id: 'test_device',
      metric: 'test_metric',
      value: 100,
      alert_time: new Date().toISOString(),
      severity: 'medium',
      alert_type: 'test'
    });
    
    const alert2 = await alertService.createAlert({
      type: 'test_alert_2',
      message: 'Test alert message 2',
      tenant_id: 'test_tenant',
      factory_id: 'test_factory',
      device_id: 'test_device',
      metric: 'test_metric',
      value: 200,
      alert_time: new Date().toISOString(),
      severity: 'high',
      alert_type: 'test'
    });
    
    const alerts = await alertService.getAllAlerts();
    
    expect(alerts).toBeDefined();
    expect(alerts.length).toBeGreaterThanOrEqual(2);
    
    // Check if both alerts are in the response
    const alertIds = alerts.map(a => a.id);
    expect(alertIds).toContain(alert1.id);
    expect(alertIds).toContain(alert2.id);
  });
  
  test('should get alerts by tenant', async () => {
    // Create test data
    await alertService.createAlert({
      type: 'test_alert_1',
      message: 'Test alert message 1',
      tenant_id: 'tenant_a',
      factory_id: 'test_factory',
      device_id: 'test_device',
      metric: 'test_metric',
      value: 100,
      alert_time: new Date().toISOString(),
      severity: 'medium',
      alert_type: 'test'
    });
    
    await alertService.createAlert({
      type: 'test_alert_2',
      message: 'Test alert message 2',
      tenant_id: 'tenant_b',
      factory_id: 'test_factory',
      device_id: 'test_device',
      metric: 'test_metric',
      value: 200,
      alert_time: new Date().toISOString(),
      severity: 'high',
      alert_type: 'test'
    });
    
    const alerts = await alertService.getAlertsByTenant('tenant_a');
    
    expect(alerts).toBeDefined();
    expect(alerts.length).toBe(1);
    expect(alerts[0].tenant_id).toBe('tenant_a');
  });
  
  test('should get alerts by tenant and factory', async () => {
    // Create test data
    await alertService.createAlert({
      type: 'test_alert_1',
      message: 'Test alert message 1',
      tenant_id: 'tenant_a',
      factory_id: 'factory_x',
      device_id: 'test_device',
      metric: 'test_metric',
      value: 100,
      alert_time: new Date().toISOString(),
      severity: 'medium',
      alert_type: 'test'
    });
    
    await alertService.createAlert({
      type: 'test_alert_2',
      message: 'Test alert message 2',
      tenant_id: 'tenant_a',
      factory_id: 'factory_y',
      device_id: 'test_device',
      metric: 'test_metric',
      value: 200,
      alert_time: new Date().toISOString(),
      severity: 'high',
      alert_type: 'test'
    });
    
    const alerts = await alertService.getAlertsByTenantAndFactory('tenant_a', 'factory_x');
    
    expect(alerts).toBeDefined();
    expect(alerts.length).toBe(1);
    expect(alerts[0].tenant_id).toBe('tenant_a');
    expect(alerts[0].factory_id).toBe('factory_x');
  });
  
  test('should resolve an alert', async () => {
    // Create test alert
    const alert = await alertService.createAlert({
      type: 'test_alert',
      message: 'Test alert message',
      tenant_id: 'test_tenant',
      factory_id: 'test_factory',
      device_id: 'test_device',
      metric: 'test_metric',
      value: 100,
      alert_time: new Date().toISOString(),
      severity: 'medium',
      alert_type: 'test'
    });
    
    // Resolve the alert
    const resolvedAlert = await alertService.resolveAlert(alert.id);
    
    expect(resolvedAlert).toBeDefined();
    expect(resolvedAlert.is_resolved).toBe(true);
    expect(resolvedAlert.resolved_at).toBeDefined();
  });
  
  test('should get unresolved alerts', async () => {
    // Create test data
    const alert1 = await alertService.createAlert({
      type: 'test_alert_1',
      message: 'Test alert message 1',
      tenant_id: 'tenant_a',
      factory_id: 'factory_x',
      device_id: 'test_device',
      metric: 'test_metric',
      value: 100,
      alert_time: new Date().toISOString(),
      severity: 'medium',
      alert_type: 'test'
    });
    
    const alert2 = await alertService.createAlert({
      type: 'test_alert_2',
      message: 'Test alert message 2',
      tenant_id: 'tenant_a',
      factory_id: 'factory_x',
      device_id: 'test_device',
      metric: 'test_metric',
      value: 200,
      alert_time: new Date().toISOString(),
      severity: 'high',
      alert_type: 'test'
    });
    
    // Resolve one alert
    await alertService.resolveAlert(alert1.id);
    
    // Get unresolved alerts
    const unresolved = await alertService.getUnresolvedAlerts();
    
    expect(unresolved).toBeDefined();
    
    // Check that resolved alert is not in the list
    const alertIds = unresolved.map(a => a.id);
    expect(alertIds).toContain(alert2.id);
    expect(alertIds).not.toContain(alert1.id);
  });
});