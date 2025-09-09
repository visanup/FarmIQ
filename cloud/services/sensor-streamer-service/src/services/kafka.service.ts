import { Kafka, Producer, Consumer } from 'kafkajs';
import { KAFKA_BROKERS, KAFKA_SSL, KAFKA_CLIENT_ID } from '../configs/config';

export class KafkaService {
  private kafka: Kafka;
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;

  constructor() {
    this.kafka = new Kafka({
      clientId: KAFKA_CLIENT_ID,
      brokers: KAFKA_BROKERS.split(','),
      ssl: KAFKA_SSL,
    });
  }

  async connectProducer(): Promise<void> {
    if (!this.producer) {
      this.producer = this.kafka.producer();
      await this.producer.connect();
      console.log('✅ Kafka producer connected');
    }
  }

  async connectConsumer(groupId: string): Promise<void> {
    if (!this.consumer) {
      this.consumer = this.kafka.consumer({ groupId });
      await this.consumer.connect();
      console.log('✅ Kafka consumer connected');
    }
  }

  async publishSensorReading(data: any): Promise<void> {
    await this.connectProducer();
    
    if (!this.producer) {
      throw new Error('Producer not connected');
    }

    await this.producer.send({
      topic: 'sensors.device.readings.v1',
      messages: [{
        key: data.deviceId,
        value: JSON.stringify({
          eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          eventType: 'sensor.reading.created',
          version: '1.0',
          timestamp: new Date().toISOString(),
          source: {
            service: 'sensor-streamer-service',
            version: '1.0.0',
          },
          data,
        }),
        timestamp: Date.now().toString(),
      }],
    });
  }

  async publishDeviceHealth(data: any): Promise<void> {
    await this.connectProducer();
    
    if (!this.producer) {
      throw new Error('Producer not connected');
    }

    await this.producer.send({
      topic: 'sensors.device.health.v1',
      messages: [{
        key: data.deviceId,
        value: JSON.stringify({
          eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          eventType: 'device.health.updated',
          version: '1.0',
          timestamp: new Date().toISOString(),
          source: {
            service: 'sensor-streamer-service',
            version: '1.0.0',
          },
          data,
        }),
        timestamp: Date.now().toString(),
      }],
    });
  }

  async publishLabReading(data: any): Promise<void> {
    await this.connectProducer();
    
    if (!this.producer) {
      throw new Error('Producer not connected');
    }

    await this.producer.send({
      topic: 'sensors.lab.readings.v1',
      messages: [{
        key: data.sampleId,
        value: JSON.stringify({
          eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          eventType: 'lab.reading.created',
          version: '1.0',
          timestamp: new Date().toISOString(),
          source: {
            service: 'sensor-streamer-service',
            version: '1.0.0',
          },
          data,
        }),
        timestamp: Date.now().toString(),
      }],
    });
  }

  async publishSweepReading(data: any): Promise<void> {
    await this.connectProducer();
    
    if (!this.producer) {
      throw new Error('Producer not connected');
    }

    await this.producer.send({
      topic: 'sensors.sweep.readings.v1',
      messages: [{
        key: data.deviceId,
        value: JSON.stringify({
          eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          eventType: 'sweep.reading.created',
          version: '1.0',
          timestamp: new Date().toISOString(),
          source: {
            service: 'sensor-streamer-service',
            version: '1.0.0',
          },
          data,
        }),
        timestamp: Date.now().toString(),
      }],
    });
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
          await handler(data);
        } catch (error) {
          console.error(`Error processing message from ${topic}:`, error);
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

