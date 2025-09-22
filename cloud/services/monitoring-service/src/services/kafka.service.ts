import { Kafka, Producer, Consumer } from 'kafkajs';
import { 
  KAFKA_BROKERS, 
  KAFKA_CLIENT_ID, 
  CONSUMER_GROUP,
  TOPIC_DEVICE_HEALTH,
  TOPIC_ANALYTICS_ALERTS,
  TOPIC_MONITORING_ALERTS,
  TOPIC_MONITORING_HEALTH
} from '../config/config';

interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
}

export class KafkaService {
  private kafka: Kafka;
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;
  private retryOptions: RetryOptions = {
    maxRetries: 3,
    baseDelay: 1000,
  };

  constructor() {
    this.kafka = new Kafka({
      clientId: KAFKA_CLIENT_ID,
      brokers: KAFKA_BROKERS.split(','),
      ssl: false,
    });
  }

  async connectProducer(): Promise<void> {
    if (!this.producer) {
      this.producer = this.kafka.producer({
        maxInFlightRequests: 1,
        idempotent: true,
        transactionTimeout: 30000,
      });
      await this.producer.connect();
      console.log('✅ Kafka producer connected');
    }
  }

  async connectConsumer(): Promise<void> {
    if (!this.consumer) {
      this.consumer = this.kafka.consumer({ 
        groupId: CONSUMER_GROUP,
        sessionTimeout: 30000,
        heartbeatInterval: 3000,
        maxBytesPerPartition: 1048576, // 1MB
        maxWaitTimeInMs: 5000,
      });
      await this.consumer.connect();
      console.log('✅ Kafka consumer connected');
    }
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.retryOptions.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.retryOptions.maxRetries) {
          console.error(`❌ ${context} failed after ${this.retryOptions.maxRetries} attempts:`, lastError);
          throw lastError;
        }
        
        const delay = this.retryOptions.baseDelay * Math.pow(2, attempt - 1);
        console.warn(`⚠️ ${context} attempt ${attempt} failed, retrying in ${delay}ms:`, lastError.message);
        
        await this.sleep(delay);
      }
    }
    
    throw lastError!;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Publish monitoring alert
  async publishMonitoringAlert(alert: any): Promise<void> {
    await this.connectProducer();
    
    if (!this.producer) {
      throw new Error('Producer not connected');
    }

    const event = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      eventType: 'monitoring.alert.created',
      version: '1.0',
      timestamp: new Date().toISOString(),
      source: {
        service: 'monitoring-service',
        version: '1.0.0',
      },
      data: {
        alertId: alert.alert_id,
        tenantId: alert.tenant_id,
        alertType: alert.alert_type,
        severity: alert.severity,
        status: alert.status,
        description: alert.description,
        farmId: alert.farm_id,
        houseId: alert.house_id,
        deviceId: alert.device_id,
        batchId: alert.batch_id,
        createdAt: alert.created_at,
        resolvedAt: alert.resolved_at,
      },
    };

    await this.executeWithRetry(async () => {
      const result = await this.producer!.send({
        topic: TOPIC_MONITORING_ALERTS,
        messages: [{
          key: alert.alert_id,
          value: JSON.stringify(event),
          timestamp: Date.now().toString(),
          headers: {
            eventType: 'monitoring.alert.created',
            version: '1.0',
          },
        }],
      });
      
      console.log(`📤 Published monitoring alert to ${TOPIC_MONITORING_ALERTS}: ${event.eventId} (partition: ${result[0].partition}, offset: ${result[0].offset})`);
      return result;
    }, 'Publish monitoring alert');
  }

  // Publish monitoring health status
  async publishMonitoringHealth(health: any): Promise<void> {
    await this.connectProducer();
    
    if (!this.producer) {
      throw new Error('Producer not connected');
    }

    const event = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      eventType: 'monitoring.health.updated',
      version: '1.0',
      timestamp: new Date().toISOString(),
      source: {
        service: 'monitoring-service',
        version: '1.0.0',
      },
      data: {
        tenantId: health.tenant_id,
        deviceId: health.device_id,
        status: health.status,
        time: health.time,
        metadata: health.meta,
      },
    };

    await this.executeWithRetry(async () => {
      const result = await this.producer!.send({
        topic: TOPIC_MONITORING_HEALTH,
        messages: [{
          key: health.device_id,
          value: JSON.stringify(event),
          timestamp: Date.now().toString(),
          headers: {
            eventType: 'monitoring.health.updated',
            version: '1.0',
          },
        }],
      });
      
      console.log(`📤 Published monitoring health to ${TOPIC_MONITORING_HEALTH}: ${event.eventId} (partition: ${result[0].partition}, offset: ${result[0].offset})`);
      return result;
    }, 'Publish monitoring health');
  }

  // Subscribe to device health events
  async subscribeToDeviceHealth(handler: (message: any) => Promise<void>): Promise<void> {
    await this.connectConsumer();
    
    if (!this.consumer) {
      throw new Error('Consumer not connected');
    }

    await this.consumer.subscribe({ topic: TOPIC_DEVICE_HEALTH, fromBeginning: false });
    
    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const data = JSON.parse(message.value?.toString() || '{}');
          console.log(`📨 Received device health from ${topic}: ${data.eventId || 'unknown'}`);
          await handler(data);
        } catch (error) {
          console.error(`❌ Error processing device health from ${topic}:`, error);
        }
      },
    });
  }

  // Subscribe to analytics alerts
  async subscribeToAnalyticsAlerts(handler: (message: any) => Promise<void>): Promise<void> {
    await this.connectConsumer();
    
    if (!this.consumer) {
      throw new Error('Consumer not connected');
    }

    await this.consumer.subscribe({ topic: TOPIC_ANALYTICS_ALERTS, fromBeginning: false });
    
    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const data = JSON.parse(message.value?.toString() || '{}');
          console.log(`📨 Received analytics alert from ${topic}: ${data.eventId || 'unknown'}`);
          await handler(data);
        } catch (error) {
          console.error(`❌ Error processing analytics alert from ${topic}:`, error);
        }
      },
    });
  }

  async disconnect(): Promise<void> {
    if (this.producer) {
      await this.producer.disconnect();
      this.producer = null;
    }
    
    if (this.consumer) {
      await this.consumer.disconnect();
      this.consumer = null;
    }
  }
}
