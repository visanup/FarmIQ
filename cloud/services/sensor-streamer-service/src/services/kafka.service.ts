import { Kafka, Producer, Consumer } from 'kafkajs';
import { 
  KAFKA_BROKERS, 
  KAFKA_SSL, 
  KAFKA_CLIENT_ID,
  TOPIC_SENSOR_READINGS,
  TOPIC_DEVICE_HEALTH,
  TOPIC_LAB_READINGS,
  TOPIC_SWEEP_READINGS
} from '../configs/config';

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
      ssl: KAFKA_SSL,
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

  async connectConsumer(groupId: string): Promise<void> {
    if (!this.consumer) {
      this.consumer = this.kafka.consumer({ 
        groupId,
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

  async publishSensorReading(data: any): Promise<void> {
    await this.connectProducer();
    
    if (!this.producer) {
      throw new Error('Producer not connected');
    }

    const event = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType: 'sensor.reading.created',
      version: '1.0',
      timestamp: new Date().toISOString(),
      source: {
        service: 'sensor-streamer-service',
        version: '1.0.0',
      },
      data: {
        deviceId: data.deviceId,
        value: data.value,
        timestamp: data.timestamp || new Date().toISOString(),
        farmId: data.farmId,
        houseId: data.houseId,
        sensorType: data.sensorType,
        unit: data.unit,
        location: data.location,
        metadata: data.metadata,
        payload: {
          unit: data.unit,
          location: data.location,
          metadata: data.metadata,
          farmId: data.farmId,
          houseId: data.houseId,
          sensorType: data.sensorType
        }
      },
    };

    await this.executeWithRetry(async () => {
      const result = await this.producer!.send({
        topic: TOPIC_SENSOR_READINGS,
        messages: [{
          key: data.deviceId,
          value: JSON.stringify(event),
          timestamp: Date.now().toString(),
          headers: {
            eventType: 'sensor.reading.created',
            version: '1.0',
          },
        }],
      });
      
      console.log(`📤 Published sensor reading to ${TOPIC_SENSOR_READINGS}: ${event.eventId} (partition: ${result[0]?.partition}, offset: ${result[0]?.offset})`);
      return result;
    }, 'Publish sensor reading');
  }

  async publishDeviceHealth(data: any): Promise<void> {
    await this.connectProducer();
    
    if (!this.producer) {
      throw new Error('Producer not connected');
    }

    const event = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType: 'device.health.updated',
      version: '1.0',
      timestamp: new Date().toISOString(),
      source: {
        service: 'sensor-streamer-service',
        version: '1.0.0',
      },
      data: {
        deviceId: data.deviceId,
        status: data.status,
        lastSeen: data.lastSeen,
        batteryLevel: data.batteryLevel,
        signalStrength: data.signalStrength,
        temperature: data.temperature,
        errors: data.errors || [],
        warnings: data.warnings || [],
      },
    };

    await this.executeWithRetry(async () => {
      const result = await this.producer!.send({
        topic: TOPIC_DEVICE_HEALTH,
        messages: [{
          key: data.deviceId,
          value: JSON.stringify(event),
          timestamp: Date.now().toString(),
          headers: {
            eventType: 'device.health.updated',
            version: '1.0',
          },
        }],
      });
      
      console.log(`📤 Published device health to ${TOPIC_DEVICE_HEALTH}: ${event.eventId} (partition: ${result[0]?.partition}, offset: ${result[0]?.offset})`);
      return result;
    }, 'Publish device health');
  }

  async publishLabReading(data: any): Promise<void> {
    await this.connectProducer();
    
    if (!this.producer) {
      throw new Error('Producer not connected');
    }

    const event = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType: 'lab.reading.created',
      version: '1.0',
      timestamp: new Date().toISOString(),
      source: {
        service: 'sensor-streamer-service',
        version: '1.0.0',
      },
      data: {
        sampleId: data.sampleId,
        farmId: data.farmId,
        stationId: data.stationId || data.deviceId || data.farmId || null,
        sensorId: data.sensorId || data.testType,
        metric: data.metric || data.testType,
        testType: data.testType,
        value: typeof data.value === 'number' ? data.value : parseFloat(String(data.value)),
        unit: data.unit,
        result: data.result,
        metadata: {
          ...data.metadata,
          customerId: data.metadata?.customerId || data.customerId || undefined,
        },
        timestamp: data.timestamp || new Date().toISOString(),
      },
    };

    await this.executeWithRetry(async () => {
      const result = await this.producer!.send({
        topic: TOPIC_LAB_READINGS,
        messages: [{
          key: data.sampleId,
          value: JSON.stringify(event),
          timestamp: Date.now().toString(),
          headers: {
            eventType: 'lab.reading.created',
            version: '1.0',
          },
        }],
      });
      
      console.log(`📤 Published lab reading to ${TOPIC_LAB_READINGS}: ${event.eventId} (partition: ${result[0]?.partition}, offset: ${result[0]?.offset})`);
      return result;
    }, 'Publish lab reading');
  }

  async publishSweepReading(data: any): Promise<void> {
    await this.connectProducer();
    
    if (!this.producer) {
      throw new Error('Producer not connected');
    }

    const event = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType: 'sweep.reading.created',
      version: '1.0',
      timestamp: new Date().toISOString(),
      source: {
        service: 'sensor-streamer-service',
        version: '1.0.0',
      },
      data: {
        deviceId: data.deviceId,
        farmId: data.farmId,
        sweepId: data.sweepId,
        data: data.data,
        metadata: data.metadata,
        timestamp: data.timestamp || new Date().toISOString(),
      },
    };

    await this.executeWithRetry(async () => {
      const result = await this.producer!.send({
        topic: TOPIC_SWEEP_READINGS,
        messages: [{
          key: data.deviceId,
          value: JSON.stringify(event),
          timestamp: Date.now().toString(),
          headers: {
            eventType: 'sweep.reading.created',
            version: '1.0',
          },
        }],
      });
      
      console.log(`📤 Published sweep reading to ${TOPIC_SWEEP_READINGS}: ${event.eventId} (partition: ${result[0]?.partition}, offset: ${result[0]?.offset})`);
      return result;
    }, 'Publish sweep reading');
  }

  async subscribeToTopic(topic: string, handler: (message: any) => Promise<void>): Promise<void> {
    await this.connectConsumer('sensor-streamer-group');
    
    if (!this.consumer) {
      throw new Error('Consumer not connected');
    }

    await this.consumer.subscribe({ topic, fromBeginning: false });
    
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const data = JSON.parse(message.value?.toString() || '{}');
          console.log(`📨 Received message from ${topic}: ${data.eventId || 'unknown'}`);
          await handler(data);
        } catch (error) {
          console.error(`❌ Error processing message from ${topic}:`, error);
          // TODO: Implement DLQ pattern for failed messages
        }
      },
    });
  }

  // Publish sensor alert
  async publishSensorAlert(data: any): Promise<void> {
    await this.executeWithRetry(async () => {
      await this.connectProducer();
      await this.producer!.send({
        topic: 'sensors.alerts.v1',
        messages: [{
          key: data.deviceId,
          value: JSON.stringify(data),
          headers: { 'content-type': 'application/json' },
        }],
      });
    }, 'publishSensorAlert');
  }

  // Publish data quality check
  async publishDataQualityCheck(data: any): Promise<void> {
    await this.executeWithRetry(async () => {
      await this.connectProducer();
      await this.producer!.send({
        topic: 'sensors.data-quality.v1',
        messages: [{
          key: data.deviceId,
          value: JSON.stringify(data),
          headers: { 'content-type': 'application/json' },
        }],
      });
    }, 'publishDataQualityCheck');
  }

  // Publish stream state
  async publishStreamState(data: any): Promise<void> {
    await this.executeWithRetry(async () => {
      await this.connectProducer();
      await this.producer!.send({
        topic: 'sensors.stream-state.v1',
        messages: [{
          key: data.deviceId,
          value: JSON.stringify(data),
          headers: { 'content-type': 'application/json' },
        }],
      });
    }, 'publishStreamState');
  }

  // Publish device configuration
  async publishDeviceConfiguration(data: any): Promise<void> {
    await this.executeWithRetry(async () => {
      await this.connectProducer();
      await this.producer!.send({
        topic: 'devices.configuration.v1',
        messages: [{
          key: data.deviceId,
          value: JSON.stringify(data),
          headers: { 'content-type': 'application/json' },
        }],
      });
    }, 'publishDeviceConfiguration');
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

