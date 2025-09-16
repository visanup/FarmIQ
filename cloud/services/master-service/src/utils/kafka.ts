import { Kafka, Producer } from 'kafkajs';
import { KAFKA_BROKERS, KAFKA_SSL, KAFKA_CLIENT_ID } from '../config/config';
import { KafkaEvent, CustomerSnapshotEvent, FarmSnapshotEvent, DeviceSnapshotEvent, FlockSnapshotEvent } from '../types';

// ---------------------------------
// Kafka client & producer (singleton)
// ---------------------------------
const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID || 'master-service',
  // NOTE: prefer env; fallback keeps localhost for dev, but in docker use kafka:9092
  brokers: (KAFKA_BROKERS || 'localhost:9094').split(','),
  ssl: KAFKA_SSL,
  connectionTimeout: 30_000,
  requestTimeout: 30_000,
  retry: { initialRetryTime: 100, retries: 8 },
});

let producer: Producer | null = null;

// ---------------------------------
// Helpers
// ---------------------------------
const toISO = (d: any): string | null => {
  if (!d) return null;
  try { return new Date(d).toISOString(); } catch { return null; }
};

const safeStr = (v: unknown, fallback = ''): string => (v === null || v === undefined ? fallback : String(v));

// 🔑 include breed_id in precedence so partitions/keys are stable for breed events
const pickKey = (data: Record<string, any>, eventId: string): string => {
  const candidate = data.breed_id || data.flock_id || data.device_id || data.farm_id || data.customer_id || data.tenant_id || data.id || `evt-${eventId}`;
  return String(candidate);
};

// ---------------------------------
// Topic map
// ---------------------------------
const TOPIC_MAP: Record<string, string> = {
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

  // extended (kept for compatibility)
  deviceType: 'master.device-type.snapshot.v1',
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
  'masterEvent.snapshot.deleted': 'master.master-event.snapshot.v1',
};

const getTopicName = (eventType: string): string => TOPIC_MAP[eventType] || 'master.unknown.snapshot.v1';

// ---------------------------------
// Publisher (singleton)
// ---------------------------------
export class KafkaPublisher {
  private static instance: KafkaPublisher;
  private constructor() {}
  public static getInstance(): KafkaPublisher {
    if (!KafkaPublisher.instance) KafkaPublisher.instance = new KafkaPublisher();
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
    if (!producer) await this.connect();

    const topic = getTopicName(event.eventType);
    const key = pickKey(event.data as any, event.eventId);

    const message = {
      key,
      value: JSON.stringify(event),
      headers: {
        'event-type': event.eventType,
        'event-version': event.version,
        'source-service': event.source.service,
        timestamp: event.timestamp,
      },
    } as const;

    // DIAGNOSTIC LOG
    try {
      console.log('[KAFKA:publish] topic =', topic, 'key =', key, 'bytes =', Buffer.byteLength(message.value, 'utf8'));
    } catch {}

    try {
      const result = await producer!.send({ topic, messages: [message] });
      console.log(`📤 Published ${event.eventType} → ${topic}`, result);
    } catch (err) {
      console.error('❌ Failed to publish event:', err);
      throw err;
    }
  }

  async publish(eventType: string, data: Record<string, any>): Promise<void> {
    const event: KafkaEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      eventType,
      version: '1.0',
      timestamp: new Date().toISOString(),
      source: { service: 'master-service', version: '1.0.0' },
      data,
    };
    await this.publishEvent(event);
  }

  // ---------------------------
  // Snapshot publishers
  // ---------------------------
  async publishCustomerSnapshot(eventType: 'customer.snapshot.created' | 'customer.snapshot.updated', customer: any): Promise<void> {
    const event: CustomerSnapshotEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      eventType,
      version: '1.0',
      timestamp: new Date().toISOString(),
      source: { service: 'master-service', version: '1.0.0' },
      data: {
        tenant_id: safeStr(customer.tenantId, 'default-tenant'),
        customer_id: safeStr(customer.id),
        name: customer.name ?? null,
        email: customer.email ?? null,
        phone: customer.phone ?? null,
        address: customer.address ?? null,
        meta: customer.meta ?? {},
        updated_at: toISO(customer.updatedAt) ?? new Date().toISOString(),
      },
    };
    await this.publishEvent(event);
  }

  async publishFarmSnapshot(eventType: 'farm.snapshot.created' | 'farm.snapshot.updated', farm: any): Promise<void> {
    const event: FarmSnapshotEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      eventType,
      version: '1.0',
      timestamp: new Date().toISOString(),
      source: { service: 'master-service', version: '1.0.0' },
      data: {
        tenant_id: safeStr(farm.tenantId, 'default-tenant'),
        farm_id: safeStr(farm.farmId ?? farm.id),
        customer_id: farm.customerId ?? null,
        name: farm.name ?? null,
        location: farm.location ?? null,
        region: farm.region ?? null,
        farm_type: farm.farmType ?? null,
        total_area: farm.totalArea ?? null,
        meta: farm.meta ?? {},
        updated_at: toISO(farm.updatedAt) ?? new Date().toISOString(),
      },
    };
    await this.publishEvent(event);
  }

  async publishDeviceSnapshot(eventType: 'device.snapshot.created' | 'device.snapshot.updated', device: any): Promise<void> {
    const event: DeviceSnapshotEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      eventType,
      version: '1.0',
      timestamp: new Date().toISOString(),
      source: { service: 'master-service', version: '1.0.0' },
      data: {
        tenant_id: safeStr(device.tenantId, 'default-tenant'),
        device_id: safeStr(device.id ?? device.deviceId),
        farm_id: device.farmId ?? null,
        house_id: device.houseId ?? null,
        type: device.type ?? null,
        status: device.status ?? null,
        name: device.name ?? null,
        model: device.model ?? null,
        vendor: device.vendor ?? null,
        serial_no: device.serialNo ?? null,
        location: device.location ?? null,
        meta: device.meta ?? {},
        updated_at: toISO(device.updatedAt) ?? new Date().toISOString(),
      },
    };
    await this.publishEvent(event);
  }

  async publishFlockSnapshot(eventType: 'flock.snapshot.created' | 'flock.snapshot.updated', flock: any): Promise<void> {
    const tenant_id = safeStr(flock.tenantId, 'default-tenant');
    const flock_id = safeStr(flock.flockId ?? flock.id);
    const house_id = flock.houseId ?? null;
    if (!flock_id) throw new Error('publishFlockSnapshot: missing flock_id (flock.flockId or flock.id)');

    const payload = {
      event: eventType,
      ts: new Date().toISOString(),
      tenant_id,
      flock_id,
      farm_id: flock.farmId ?? null,
      house_id,
      animal_type_id: flock.animalTypeId ?? null,
      breed_id: flock.breedId ?? null,
      name: flock.name ?? null,
      start_date: toISO(flock.startDate) ?? new Date().toISOString(),
      end_date: toISO(flock.endDate),
      population: typeof flock.population === 'number' ? flock.population : null,
      sex: flock.sex ?? null,
      source_farm: flock.sourceFarm ?? null,
      vaccination_status: flock.vaccinationStatus ?? null,
      feed_type: flock.feedType ?? null,
      health_status: flock.healthStatus ?? null,
      status: flock.status ?? null,
      meta: flock.meta ?? {},
      updated_at: toISO(flock.updatedAt) ?? new Date().toISOString(),
    };

    console.log('[PUBLISH] master.flock.snapshot.v1 =>', JSON.stringify(payload));

    const event: FlockSnapshotEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      eventType,
      version: '1.0',
      timestamp: new Date().toISOString(),
      source: { service: 'master-service', version: '1.0.0' },
      data: payload as any,
    };

    await this.publishEvent(event);
  }

  async publishAnimalTypeSnapshot(eventType: 'animal-type.snapshot.created' | 'animal-type.snapshot.updated', animalType: any): Promise<void> {
    const event: KafkaEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      eventType,
      version: '1.0',
      timestamp: new Date().toISOString(),
      source: { service: 'master-service', version: '1.0.0' },
      data: {
        tenant_id: safeStr(animalType.tenantId, 'default-tenant'),
        animal_type_id: safeStr(animalType.id),
        name: animalType.name ?? null,
        category: animalType.category ?? null,
        description: animalType.description ?? null,
        meta: animalType.meta ?? {},
        updated_at: toISO(animalType.updatedAt) ?? new Date().toISOString(),
      },
    };
    await this.publishEvent(event);
  }

  async publishBreedSnapshot(eventType: 'breed.snapshot.created' | 'breed.snapshot.updated', breed: any): Promise<void> {
    // DIAGNOSTIC: ensure we actually call this
    console.log('[BREED:publish] eventType =', eventType, 'id =', breed?.id, 'animalTypeId =', breed?.animalTypeId);

    // Guard: animalTypeId is required for downstream (but we still publish with null to see it fail fast there)
    if (!breed || !breed.id) throw new Error('publishBreedSnapshot: missing breed.id');

    const event: KafkaEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      eventType,
      version: '1.0',
      timestamp: new Date().toISOString(),
      source: { service: 'master-service', version: '1.0.0' },
      data: {
        tenant_id: safeStr(breed.tenantId, 'default-tenant'),
        breed_id: safeStr(breed.id),
        // do NOT wrap with safeStr(null) – that would turn null into 'null'
        animal_type_id: breed.animalTypeId ? String(breed.animalTypeId) : null,
        name: breed.name ?? null,
        code: breed.code ?? null,
        description: breed.description ?? null,
        // use objects for json columns – not null
        characteristics: breed.characteristics ?? {},
        meta: breed.meta ?? {},
        updated_at: toISO(breed.updatedAt) ?? new Date().toISOString(),
      },
    };

    await this.publishEvent(event);
  }
}

export const kafkaPublisher = KafkaPublisher.getInstance();

export async function publishToKafka(eventType: string, data: Record<string, any>): Promise<void> {
  try { await kafkaPublisher.publish(eventType, data); }
  catch (error) { console.warn(`⚠️ Failed to publish ${eventType} to Kafka:`, (error as Error).message); }
}
