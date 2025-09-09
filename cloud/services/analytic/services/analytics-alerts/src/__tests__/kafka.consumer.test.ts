// src/__tests__/kafka.consumer.test.ts
import { Kafka } from 'kafkajs';
import { connectKafka, consumer, producer } from '../../utils/kafka';
import { KAFKA_BROKERS } from '../../configs/config';
import { handleAnalyticsFeature } from '../../pipelines/map/analyticsFeature';
import { AlertService } from '../../services/alert.service';
import { AppDataSource } from '../../database';
import { Alert } from '../../models/alert.model';
import { getRepository } from 'typeorm';

describe('Kafka Consumer', () => {
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
  
  test('should connect to Kafka and consume messages', async () => {
    // Connect to Kafka
    await connectKafka(['analytics.features']);
    
    // Create test Kafka client
    const kafka = new Kafka({
      clientId: 'test-producer',
      brokers: KAFKA_BROKERS.split(',')
    });
    
    const testProducer = kafka.producer();
    await testProducer.connect();
    
    // Create test message
    const testMessage = {
      bucket_start: new Date().toISOString(),
      window_s: 60,
      tenant_id: 'test_tenant',
      factory_id: 'test_factory',
      machine_id: 'test_machine',
      sensor_id: 'test_sensor',
      metric: 'temp',
      avg_val: 35.5,
      count_n: 10
    };
    
    // Send test message
    await testProducer.send({
      topic: 'analytics.features',
      messages: [{ value: JSON.stringify(testMessage) }]
    });
    
    // Wait for message to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if alert was created
    const alerts = await alertService.getAlertsByTenant('test_tenant');
    
    // Disconnect from Kafka
    await testProducer.disconnect();
    await disconnectKafka();
    
    // Verify alert creation
    expect(alerts.length).toBeGreaterThanOrEqual(1);
    const alert = alerts[0];
    expect(alert.tenant_id).toBe(testMessage.tenant_id);
    expect(alert.factory_id).toBe(testMessage.factory_id);
    expect(alert.device_id).toBe(testMessage.machine_id);
    expect(alert.metric).toBe(testMessage.metric);
    expect(alert.value).toBe(testMessage.avg_val);
    expect(alert.severity).toBe('high');
    expect(alert.alert_type).toBe('temperature');
  });
});