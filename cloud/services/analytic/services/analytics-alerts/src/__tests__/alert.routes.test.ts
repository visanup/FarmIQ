// src/__tests__/alert.routes.test.ts
import request from 'supertest';
import { app } from '../../src/server';
import { AlertService } from '../../src/services/alert.service';
import { AppDataSource } from '../../src/utils/dataSource';
import { Alert } from '../../src/models/alert.model';
import { getRepository } from 'typeorm';

describe('Alert Routes', () => {
  let alertService: AlertService;
  let server: any;
  
  beforeAll(async () => {
    // Initialize database
    await AppDataSource.initialize();
    
    // Initialize alert service
    alertService = new AlertService();
    
    // Clear alerts before each test
    await getRepository(Alert).clear();
    
    // Start server
    server = app.listen(7306);
  });
  
  afterAll(async () => {
    // Close server
    server.close();
    
    // Close database connection
    await AppDataSource.destroy();
  });
  
  test('GET /alerts should return empty array initially', async () => {
    const response = await request(app).get('/api/alerts');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
  
  test('POST /alerts should create a new alert', async () => {
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
    
    const response = await request(app)
      .post('/api/alerts')
      .send(alertData);
    
    expect(response.status).toBe(201);
    expect(response.body.type).toBe(alertData.type);
    expect(response.body.message).toBe(alertData.message);
    expect(response.body.tenant_id).toBe(alertData.tenant_id);
    expect(response.body.factory_id).toBe(alertData.factory_id);
    expect(response.body.device_id).toBe(alertData.device_id);
    expect(response.body.metric).toBe(alertData.metric);
    expect(response.body.value).toBe(alertData.value);
    expect(response.body.severity).toBe(alertData.severity);
    expect(response.body.alert_type).toBe(alertData.alert_type);
    expect(response.body.id).toBeDefined();
  });
  
  test('GET /alerts should return all alerts', async () => {
    // Create test alerts
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
    
    const response = await request(app).get('/api/alerts');
    
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
  });
  
  test('GET /alerts/:id should return specific alert', async () => {
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
    
    const response = await request(app).get(`/api/alerts/${alert.id}`);
    
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(alert.id);
    expect(response.body.type).toBe(alert.type);
    expect(response.body.message).toBe(alert.message);
    expect(response.body.tenant_id).toBe(alert.tenant_id);
    expect(response.body.factory_id).toBe(alert.factory_id);
    expect(response.body.device_id).toBe(alert.device_id);
    expect(response.body.metric).toBe(alert.metric);
    expect(response.body.value).toBe(alert.value);
    expect(response.body.severity).toBe(alert.severity);
    expect(response.body.alert_type).toBe(alert.alert_type);
  });
  
  test('GET /alerts/:id should return 404 for non-existent alert', async () => {
    const response = await request(app).get('/api/alerts/999999');
    expect(response.status).toBe(404);
  });
  
  test('GET /alerts/tenant/:tenantId should return alerts by tenant', async () => {
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
    
    const response = await request(app).get('/api/alerts/tenant/tenant_a');
    
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].tenant_id).toBe('tenant_a');
  });
  
  test('GET /alerts/tenant/:tenantId/factory/:factoryId should return alerts by tenant and factory', async () => {
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
    
    const response = await request(app)
      .get('/api/alerts/tenant/tenant_a/factory/factory_x');
    
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].tenant_id).toBe('tenant_a');
    expect(response.body[0].factory_id).toBe('factory_x');
  });
  
  test('GET /alerts/unresolved should return unresolved alerts', async () => {
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
    
    const response = await request(app).get('/api/alerts/unresolved');
    
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].id).toBe(alert2.id);
  });
  
  test('PUT /alerts/:id/resolve should resolve an alert', async () => {
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
    const response = await request(app)
      .put(`/api/alerts/${alert.id}/resolve`);
    
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(alert.id);
    expect(response.body.is_resolved).toBe(true);
    expect(response.body.resolved_at).toBeDefined();
  });
  
  test('PUT /alerts/:id/resolve should return 404 for non-existent alert', async () => {
    const response = await request(app)
      .put('/api/alerts/999999/resolve');
    
    expect(response.status).toBe(404);
  });
});