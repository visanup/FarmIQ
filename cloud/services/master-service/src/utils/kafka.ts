import { Kafka, Producer, Consumer } from 'kafkajs';
import { 
  KAFKA_BROKERS, 
  KAFKA_SSL, 
  KAFKA_CLIENT_ID 
} from '../config/config';
import { 
  KafkaEvent, 
  CustomerSnapshotEvent, 
  FarmSnapshotEvent, 
  DeviceSnapshotEvent, 
  FlockSnapshotEvent 
} from '../types';

// Kafka client configuration
const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: KAFKA_BROKERS.split(','),
  ssl: KAFKA_SSL,
  connectionTimeout: 30000,
  requestTimeout: 30000,
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

// Producer instance
let producer: Producer | null = null;

export class KafkaPublisher {
  private static instance: KafkaPublisher;

  private constructor() {}

  public static getInstance(): KafkaPublisher {
    if (!KafkaPublisher.instance) {
      KafkaPublisher.instance = new KafkaPublisher();
    }
    return KafkaPublisher.instance;
  }

  async connect(): Promise<void> {
    if (!producer) {
      producer = kafka.producer();
      await producer.connect();
      console.log('✅ Kafka producer connected');
    }
  }

  async disconnect(): Promise<void> {
    if (producer) {
      await producer.disconnect();
      producer = null;
      console.log('❌ Kafka producer disconnected');
    }
  }

  async publishEvent(event: KafkaEvent): Promise<void> {
    if (!producer) {
      await this.connect();
    }

    try {
      const result = await producer!.send({
        topic: this.getTopicName(event.eventType),
        messages: [
          {
            key: event.data.id || event.data.tenant_id || event.data.customer_id || event.data.farm_id || event.data.device_id || event.data.flock_id,
            value: JSON.stringify(event),
            headers: {
              'event-type': event.eventType,
              'event-version': event.version,
              'source-service': event.source.service,
              'timestamp': event.timestamp
            }
          }
        ]
      });

      console.log(`📤 Published event ${event.eventType} to topic ${this.getTopicName(event.eventType)}:`, result);
    } catch (error) {
      console.error('❌ Failed to publish event:', error);
      throw error;
    }
  }

  private getTopicName(eventType: string): string {
    const topicMap: Record<string, string> = {
      'customer.snapshot.created': 'master.customer.snapshot.v1',
      'customer.snapshot.updated': 'master.customer.snapshot.v1',
      'farm.snapshot.created': 'master.farm.snapshot.v1',
      'farm.snapshot.updated': 'master.farm.snapshot.v1',
      'house.snapshot.created': 'master.house.snapshot.v1',
      'house.snapshot.updated': 'master.house.snapshot.v1',
      'device.snapshot.created': 'master.device.snapshot.v1',
      'device.snapshot.updated': 'master.device.snapshot.v1',
      'flock.snapshot.created': 'master.flock.snapshot.v1',
      'flock.snapshot.updated': 'master.flock.snapshot.v1',
      'animal-type.snapshot.created': 'master.animal-type.snapshot.v1',
      'animal-type.snapshot.updated': 'master.animal-type.snapshot.v1',
      'breed.snapshot.created': 'master.breed.snapshot.v1',
      'breed.snapshot.updated': 'master.breed.snapshot.v1',
      // Extended snapshots
      'deviceType.snapshot.created': 'master.device-type.snapshot.v1',
      'deviceType.snapshot.updated': 'master.device-type.snapshot.v1',
      'deviceType.snapshot.deleted': 'master.device-type.snapshot.v1',
      'sensorType.snapshot.created': 'master.sensor-type.snapshot.v1',
      'sensorType.snapshot.updated': 'master.sensor-type.snapshot.v1',
      'sensorType.snapshot.deleted': 'master.sensor-type.snapshot.v1',
      'deviceHealth.snapshot.created': 'master.device-health.snapshot.v1',
      'deviceHealth.snapshot.updated': 'master.device-health.snapshot.v1',
      'deviceHealth.snapshot.deleted': 'master.device-health.snapshot.v1',
      'zone.snapshot.created': 'master.zone.snapshot.v1',
      'zone.snapshot.updated': 'master.zone.snapshot.v1',
      'zone.snapshot.deleted': 'master.zone.snapshot.v1',
      'station.snapshot.created': 'master.station.snapshot.v1',
      'station.snapshot.updated': 'master.station.snapshot.v1',
      'station.snapshot.deleted': 'master.station.snapshot.v1',
      // New services
      'feedType.snapshot.created': 'master.feed-type.snapshot.v1',
      'feedType.snapshot.updated': 'master.feed-type.snapshot.v1',
      'feedType.snapshot.deleted': 'master.feed-type.snapshot.v1',
      'formula.snapshot.created': 'master.formula.snapshot.v1',
      'formula.snapshot.updated': 'master.formula.snapshot.v1',
      'formula.snapshot.deleted': 'master.formula.snapshot.v1',
      'economicData.snapshot.created': 'master.economic-data.snapshot.v1',
      'economicData.snapshot.updated': 'master.economic-data.snapshot.v1',
      'economicData.snapshot.deleted': 'master.economic-data.snapshot.v1',
      'externalDataSource.snapshot.created': 'master.external-data-source.snapshot.v1',
      'externalDataSource.snapshot.updated': 'master.external-data-source.snapshot.v1',
      'externalDataSource.snapshot.deleted': 'master.external-data-source.snapshot.v1',
      'masterEvent.snapshot.created': 'master.master-event.snapshot.v1',
      'masterEvent.snapshot.updated': 'master.master-event.snapshot.v1',
      'masterEvent.snapshot.deleted': 'master.master-event.snapshot.v1'
    };

    return topicMap[eventType] || 'master.unknown.snapshot.v1';
  }

  // Generic publish wrapper used by services expecting a simple call
  async publish(eventType: string, data: Record<string, any>): Promise<void> {
    const event: KafkaEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      version: '1.0',
      timestamp: new Date().toISOString(),
      source: { service: 'master-service', version: '1.0.0' },
      data,
    };
    await this.publishEvent(event);
  }

  // Helper methods for creating specific events
  async publishCustomerSnapshot(
    eventType: 'customer.snapshot.created' | 'customer.snapshot.updated',
    customer: any
  ): Promise<void> {
    const event: CustomerSnapshotEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      version: '1.0',
      timestamp: new Date().toISOString(),
      source: {
        service: 'master-service',
        version: '1.0.0'
      },
      data: {
        tenant_id: customer.tenantId,
        customer_id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        meta: customer.meta,
        updated_at: customer.updatedAt
      }
    };

    await this.publishEvent(event);
  }

  async publishFarmSnapshot(
    eventType: 'farm.snapshot.created' | 'farm.snapshot.updated',
    farm: any
  ): Promise<void> {
    const event: FarmSnapshotEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      version: '1.0',
      timestamp: new Date().toISOString(),
      source: {
        service: 'master-service',
        version: '1.0.0'
      },
      data: {
        tenant_id: farm.tenantId,
        farm_id: farm.farmId,
        customer_id: farm.customerId,
        name: farm.name,
        location: farm.location,
        region: farm.region,
        farm_type: farm.farmType,
        total_area: farm.totalArea,
        meta: farm.meta,
        updated_at: farm.updatedAt
      }
    };

    await this.publishEvent(event);
  }

  async publishDeviceSnapshot(
    eventType: 'device.snapshot.created' | 'device.snapshot.updated',
    device: any
  ): Promise<void> {
    const event: DeviceSnapshotEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      version: '1.0',
      timestamp: new Date().toISOString(),
      source: {
        service: 'master-service',
        version: '1.0.0'
      },
      data: {
        tenant_id: device.tenantId,
        device_id: device.deviceId,
        farm_id: device.farmId,
        house_id: device.houseId,
        type: device.type,
        status: device.status,
        name: device.name,
        model: device.model,
        vendor: device.vendor,
        serial_no: device.serialNo,
        location: device.location,
        meta: device.meta,
        updated_at: device.updatedAt
      }
    };

    await this.publishEvent(event);
  }

  async publishFlockSnapshot(
    eventType: 'flock.snapshot.created' | 'flock.snapshot.updated',
    flock: any
  ): Promise<void> {
    const event: FlockSnapshotEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      version: '1.0',
      timestamp: new Date().toISOString(),
      source: {
        service: 'master-service',
        version: '1.0.0'
      },
      data: {
        tenant_id: flock.tenantId,
        flock_id: flock.flockId,
        farm_id: flock.farmId,
        house_id: flock.houseId,
        animal_type_id: flock.animalTypeId,
        breed_id: flock.breedId,
        name: flock.name,
        start_date: flock.startDate,
        end_date: flock.endDate,
        population: flock.population,
        sex: flock.sex,
        source_farm: flock.sourceFarm,
        vaccination_status: flock.vaccinationStatus,
        feed_type: flock.feedType,
        health_status: flock.healthStatus,
        status: flock.status,
        meta: flock.meta,
        updated_at: flock.updatedAt
      }
    };

    await this.publishEvent(event);
  }

  async publishAnimalTypeSnapshot(
    eventType: 'animal-type.snapshot.created' | 'animal-type.snapshot.updated',
    animalType: any
  ): Promise<void> {
    const event: KafkaEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      version: '1.0',
      timestamp: new Date().toISOString(),
      source: {
        service: 'master-service',
        version: '1.0.0'
      },
      data: {
        id: animalType.id,
        name: animalType.name,
        category: animalType.category,
        description: animalType.description,
        meta: animalType.meta,
        updated_at: animalType.updatedAt
      }
    };

    await this.publishEvent(event);
  }

  async publishBreedSnapshot(
    eventType: 'breed.snapshot.created' | 'breed.snapshot.updated',
    breed: any
  ): Promise<void> {
    const event: KafkaEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      version: '1.0',
      timestamp: new Date().toISOString(),
      source: {
        service: 'master-service',
        version: '1.0.0'
      },
      data: {
        id: breed.id,
        animal_type_id: breed.animalTypeId,
        name: breed.name,
        code: breed.code,
        description: breed.description,
        characteristics: breed.characteristics,
        meta: breed.meta,
        updated_at: breed.updatedAt
      }
    };

    await this.publishEvent(event);
  }
}

// Export singleton instance
export const kafkaPublisher = KafkaPublisher.getInstance();

// Simple publishToKafka function for backward compatibility
export async function publishToKafka(eventType: string, data: Record<string, any>): Promise<void> {
  try {
    await kafkaPublisher.publish(eventType, data);
  } catch (error) {
    console.warn(`⚠️ Failed to publish ${eventType} to Kafka:`, (error as Error).message);
  }
}
