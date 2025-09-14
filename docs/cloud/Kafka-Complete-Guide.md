# Kafka Complete Guide for FarmIQ Cloud

เน€เธญเธเธชเธฒเธฃเธเธฃเธเธ–เนเธงเธเธชเธณเธซเธฃเธฑเธเธเธฒเธฃเนเธเนเธเธฒเธ Apache Kafka เนเธเธฃเธฐเธเธ FarmIQ Cloud เธฃเธงเธกเธ–เธถเธ Event-Driven Architecture, Topics Management, เนเธฅเธฐ Best Practices

## ๐“ เธชเธฒเธฃเธเธฑเธ

1. [Event-Driven Architecture Overview](#event-driven-architecture-overview)
2. [Topic Management](#topic-management)
3. [Event Schema Patterns](#event-schema-patterns)
4. [Producer Patterns](#producer-patterns)
5. [Consumer Patterns](#consumer-patterns)
6. [Error Handling and Resilience](#error-handling-and-resilience)
7. [Monitoring and Observability](#monitoring-and-observability)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Event-Driven Architecture Overview

FarmIQ Cloud-Layer เนเธเน Event-Driven Architecture เนเธ”เธขเธกเธต Apache Kafka เน€เธเนเธ message broker เธซเธฅเธฑเธเธชเธณเธซเธฃเธฑเธเธเธฒเธฃเธชเธทเนเธญเธชเธฒเธฃเธฃเธฐเธซเธงเนเธฒเธ microservices

### Architecture Benefits
- **Loose Coupling**: Services เนเธกเนเธ•เนเธญเธเธฃเธนเนเธเธฑเธเธเธฑเธเนเธ”เธขเธ•เธฃเธ
- **Scalability**: เธชเธฒเธกเธฒเธฃเธ– scale เนเธ•เนเธฅเธฐ service เนเธขเธเธเธฑเธเนเธ”เน
- **Resilience**: เธฃเธฐเธเธเธขเธฑเธเธ—เธณเธเธฒเธเนเธ”เนเนเธกเนเธกเธต service เธฅเนเธกเน€เธซเธฅเธง
- **Real-time Processing**: เธเนเธญเธกเธนเธฅเนเธซเธฅเนเธเธ real-time

---

## Topic Management

### ๐“ เนเธเธฅเนเธ—เธตเนเน€เธเธตเนเธขเธงเธเนเธญเธ

- `cloud/kafka-topics.yml` - เนเธเธฅเน configuration เธซเธฅเธฑเธเธชเธณเธซเธฃเธฑเธ topics เธ—เธฑเนเธเธซเธกเธ”
- `cloud/scripts/create-kafka-topics.sh` - Script เธชเธณเธซเธฃเธฑเธ Linux/macOS
- `cloud/scripts/create-kafka-topics.ps1` - Script เธชเธณเธซเธฃเธฑเธ Windows PowerShell
- `docker-compose.infra.yml` - Docker Compose configuration เธ—เธตเนเธฃเธงเธก Kafka

### ๐€ เธเธฒเธฃเนเธเนเธเธฒเธ

#### 1. เน€เธฃเธดเนเธกเธ•เนเธเธฃเธฐเธเธ Infrastructure

```bash
# เน€เธฃเธดเนเธก Kafka เนเธฅเธฐเธชเธฃเนเธฒเธ topics เธญเธฑเธ•เนเธเธกเธฑเธ•เธด
docker-compose -f docker-compose.infra.yml up -d

# เธ•เธฃเธงเธเธชเธญเธเธชเธ–เธฒเธเธฐ
docker-compose -f docker-compose.infra.yml ps
```

#### 2. เธเธฒเธฃเธเธฑเธ”เธเธฒเธฃ Topics เนเธเธ Manual

**Linux/macOS:**
```bash
# เธชเธฃเนเธฒเธ topics เธ—เธฑเนเธเธซเธกเธ”
./cloud/scripts/create-kafka-topics.sh

# เธ”เธนเธฃเธฒเธขเธเธฒเธฃ topics
./cloud/scripts/create-kafka-topics.sh list

# เธ”เธนเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ” topic
./cloud/scripts/create-kafka-topics.sh describe sensors.device.readings.v1

# เธฅเธ topic (เธฃเธฐเธงเธฑเธ!)
./cloud/scripts/create-kafka-topics.sh delete test-topic
```

**Windows PowerShell:**
```powershell
# เธชเธฃเนเธฒเธ topics เธ—เธฑเนเธเธซเธกเธ”
.\cloud\scripts\create-kafka-topics.ps1

# เธ”เธนเธฃเธฒเธขเธเธฒเธฃ topics
.\cloud\scripts\create-kafka-topics.ps1 -Command list

# เธ”เธนเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ” topic
.\cloud\scripts\create-kafka-topics.ps1 -Command describe -TopicName sensors.device.readings.v1

# เธฅเธ topic (เธฃเธฐเธงเธฑเธ!)
.\cloud\scripts\create-kafka-topics.ps1 -Command delete -TopicName test-topic
```

### ๐“ เธฃเธฒเธขเธเธฒเธฃ Topics

#### Master Service Topics
- `master.customer.snapshot.v1` - เธเนเธญเธกเธนเธฅเธฅเธนเธเธเนเธฒ
- `master.farm.snapshot.v1` - เธเนเธญเธกเธนเธฅเธเธฒเธฃเนเธก
- `master.house.snapshot.v1` - เธเนเธญเธกเธนเธฅเนเธฃเธเน€เธฃเธทเธญเธ
- `master.device.snapshot.v1` - เธเนเธญเธกเธนเธฅเธญเธธเธเธเธฃเธ“เน
- `master.flock.snapshot.v1` - เธเนเธญเธกเธนเธฅเธเธนเธเธชเธฑเธ•เธงเน
- `master.animal-type.snapshot.v1` - เธเนเธญเธกเธนเธฅเธเธฃเธฐเน€เธ เธ—เธชเธฑเธ•เธงเน
- `master.breed.snapshot.v1` - เธเนเธญเธกเธนเธฅเธชเธฒเธขเธเธฑเธเธเธธเน

#### Sensor Data Topics
- `sensors.device.readings.v1` - เธเนเธญเธกเธนเธฅเน€เธเนเธเน€เธเธญเธฃเนเนเธเธ real-time
- `sensors.device.health.v1` - เธชเธ–เธฒเธเธฐเธชเธธเธเธ เธฒเธเธญเธธเธเธเธฃเธ“เน
- `sensors.lab.readings.v1` - เธเนเธญเธกเธนเธฅเธเธฒเธฃเธ—เธ”เธชเธญเธเนเธเธซเนเธญเธเธเธเธดเธเธฑเธ•เธดเธเธฒเธฃ
- `sensors.sweep.readings.v1` - เธเนเธญเธกเธนเธฅเธเธฒเธฃเธชเนเธเธ/เธเธงเธฒเธ”

#### Farm Operational Topics
- `farms.operational.event.v1` - เน€เธซเธ•เธธเธเธฒเธฃเธ“เนเธเธฒเธฃเธ”เธณเน€เธเธดเธเธเธฒเธเธเธฒเธฃเนเธก
- `farms.farm.snapshot.v1` - Snapshot เธเนเธญเธกเธนเธฅเธเธฒเธฃเนเธก
- `farms.house.snapshot.v1` - Snapshot เธเนเธญเธกเธนเธฅเนเธฃเธเน€เธฃเธทเธญเธ
- `farms.flock.snapshot.v1` - Snapshot เธเนเธญเธกเธนเธฅเธเธนเธเธชเธฑเธ•เธงเน

#### Feed Management Topics
- `feed.batch.created.v1` - เธเธฒเธฃเธชเธฃเนเธฒเธ batch เธญเธฒเธซเธฒเธฃ
- `feed.quality.result.v1` - เธเธฅเธเธฒเธฃเธ—เธ”เธชเธญเธเธเธธเธ“เธ เธฒเธเธญเธฒเธซเธฒเธฃ

#### Economics Topics
- `economics.cost.txn.v1` - เธเนเธญเธกเธนเธฅเธ•เนเธเธ—เธธเธเนเธฅเธฐเธเธฒเธฃเธ—เธณเธเธธเธฃเธเธฃเธฃเธก

#### External Data Topics
- `external.weather.observation.v1` - เธเนเธญเธกเธนเธฅเธชเธ เธฒเธเธญเธฒเธเธฒเธจ

#### Analytics Topics
- `analytics.features` - เธเนเธญเธกเธนเธฅ features เธชเธณเธซเธฃเธฑเธ analytics
- `analytics.features.materialized.v1` - Materialized features
- `analytics.prediction.v1` - เธเธฅเธเธฒเธฃเธ—เธณเธเธฒเธข ML
- `analytics.anomaly.v1` - เธเธฅเธเธฒเธฃเธ•เธฃเธงเธเธเธฑเธเธเธงเธฒเธกเธเธดเธ”เธเธเธ•เธด
- `analytics.invalid-readings` - Dead letter queue เธชเธณเธซเธฃเธฑเธเธเนเธญเธกเธนเธฅเธ—เธตเนเนเธกเนเธ–เธนเธเธ•เนเธญเธ

#### Device Management Topics
- `devices.device.snapshot.v1` - Snapshot เธเธฒเธฃเธ•เธฑเนเธเธเนเธฒเธญเธธเธเธเธฃเธ“เน

#### Formula Management Topics
- `formula.recipe.snapshot.v1` - Snapshot เธชเธนเธ•เธฃเธญเธฒเธซเธฒเธฃ

### โ๏ธ เธเธฒเธฃเธเธณเธซเธเธ”เธเนเธฒ Topics

#### Retention Policy
- **Compact Topics**: เน€เธเนเธเธเนเธญเธกเธนเธฅเธฅเนเธฒเธชเธธเธ”เน€เธ—เนเธฒเธเธฑเนเธ (master data)
- **Delete Topics**: เน€เธเนเธเธเนเธญเธกเธนเธฅเธ•เธฒเธกเน€เธงเธฅเธฒเธ—เธตเนเธเธณเธซเธเธ” (sensor data)

#### Retention Time
- **Master Data**: 7 เธงเธฑเธ
- **Sensor Data**: 30-90 เธงเธฑเธ
- **Analytics Data**: 30-90 เธงเธฑเธ
- **Economic Data**: 1 เธเธต

#### Partitions
- **High Volume**: 6 partitions (sensor readings, analytics features)
- **Medium Volume**: 3 partitions (เธชเนเธงเธเนเธซเธเน)
- **Low Volume**: 1 partition (เธ–เนเธฒเธเธณเน€เธเนเธ)

### ๐”ง เธเธฒเธฃเนเธเนเนเธ Topics

#### 1. เนเธเนเนเธเนเธเธฅเน Configuration
```yaml
# เนเธเนเนเธเนเธ cloud/kafka-topics.yml
topics:
  sensors:
    device_readings:
      - name: "sensors.device.readings.v1"
        partitions: 8  # เน€เธเธดเนเธก partitions
        replication_factor: 1
        config:
          retention.ms: "5184000000"  # เน€เธเธดเนเธก retention เน€เธเนเธ 60 เธงเธฑเธ
```

#### 2. Restart Kafka
```bash
# เธซเธขเธธเธ” Kafka
docker-compose -f docker-compose.infra.yml stop kafka

# เน€เธฃเธดเนเธกเนเธซเธกเน
docker-compose -f docker-compose.infra.yml up -d kafka

# เธฃเธญเนเธซเน Kafka เธเธฃเนเธญเธก เนเธฅเนเธงเธชเธฃเนเธฒเธ topics เนเธซเธกเน
docker-compose -f docker-compose.infra.yml up kafka-init-topics
```

---

## Event Schema Patterns

### Topic Naming Convention

#### Pattern: `{domain}.{entity}.{action}.v{version}`

```
sensors.device.readings.v1          # Sensor readings from devices
sensors.device.health.v1            # Device health status
master.farm.snapshot.v1             # Farm master data (compact)
master.operational.event.v1         # Farm operational events
analytics.prediction.v1             # ML predictions
master.economic.txn.v1              # Cost transactions
```

### 1. Sensor Data Events

#### Device Readings Event
```json
{
  "eventId": "evt_1234567890",
  "eventType": "sensor.reading.created",
  "version": "1.0",
  "timestamp": "2024-01-15T10:30:00Z",
  "source": {
    "service": "sensor-streamer-service",
    "version": "1.0.0"
  },
  "data": {
    "deviceId": "dev_001",
    "farmId": "farm_001",
    "houseId": "house_001",
    "sensorType": "temperature",
    "value": 25.5,
    "unit": "celsius",
    "location": {
      "x": 10.5,
      "y": 20.3,
      "z": 1.2
    },
    "metadata": {
      "batteryLevel": 85,
      "signalStrength": -45,
      "calibrationDate": "2024-01-01T00:00:00Z"
    }
  }
}
```

#### Device Health Event
```json
{
  "eventId": "evt_1234567891",
  "eventType": "device.health.updated",
  "version": "1.0",
  "timestamp": "2024-01-15T10:30:00Z",
  "source": {
    "service": "devices-service",
    "version": "1.0.0"
  },
  "data": {
    "deviceId": "dev_001",
    "status": "online",
    "lastSeen": "2024-01-15T10:29:45Z",
    "batteryLevel": 85,
    "signalStrength": -45,
    "temperature": 35.2,
    "errors": [],
    "warnings": ["low_battery"]
  }
}
```

### 2. Master Data Events (Compact Topics)

#### Farm Snapshot Event
```json
{
  "eventId": "evt_1234567892",
  "eventType": "farm.snapshot.updated",
  "version": "1.0",
  "timestamp": "2024-01-15T10:30:00Z",
  "source": {
    "service": "farms-master-service",
    "version": "1.0.0"
  },
  "data": {
    "farmId": "farm_001",
    "name": "Green Valley Farm",
    "ownerId": "user_001",
    "location": {
      "address": "123 Farm Road",
      "city": "Bangkok",
      "province": "Bangkok",
      "country": "Thailand",
      "coordinates": {
        "lat": 13.7563,
        "lng": 100.5018
      }
    },
    "settings": {
      "timezone": "Asia/Bangkok",
      "currency": "THB",
      "units": "metric"
    },
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 3. Operational Events

#### Farm Operational Event
```json
{
  "eventId": "evt_1234567893",
  "eventType": "farm.operational.event.created",
  "version": "1.0",
  "timestamp": "2024-01-15T10:30:00Z",
  "source": {
    "service": "farms-operational-service",
    "version": "1.0.0"
  },
  "data": {
    "eventId": "op_evt_001",
    "farmId": "farm_001",
    "houseId": "house_001",
    "flockId": "flock_001",
    "eventType": "feeding",
    "description": "Morning feeding completed",
    "details": {
      "feedType": "starter_feed",
      "amount": 100.5,
      "unit": "kg",
      "duration": 30,
      "durationUnit": "minutes"
    },
    "performedBy": "user_001",
    "performedAt": "2024-01-15T08:00:00Z",
    "metadata": {
      "weather": "sunny",
      "temperature": 28.5,
      "humidity": 65
    }
  }
}
```

### 4. Analytics Events

#### ML Prediction Event
```json
{
  "eventId": "evt_1234567894",
  "eventType": "analytics.prediction.created",
  "version": "1.0",
  "timestamp": "2024-01-15T10:30:00Z",
  "source": {
    "service": "analytics-worker",
    "version": "1.0.0"
  },
  "data": {
    "predictionId": "pred_001",
    "modelId": "weight_prediction_v1",
    "modelVersion": "1.0.0",
    "farmId": "farm_001",
    "flockId": "flock_001",
    "predictionType": "weight_gain",
    "predictedValue": 2.5,
    "unit": "kg",
    "confidence": 0.85,
    "predictionDate": "2024-01-20T00:00:00Z",
    "features": {
      "age_days": 45,
      "feed_intake_avg": 120.5,
      "temperature_avg": 28.2,
      "humidity_avg": 65.0
    },
    "metadata": {
      "trainingDataSize": 10000,
      "lastModelUpdate": "2024-01-10T00:00:00Z"
    }
  }
}
```

---

## Producer Patterns

### 1. TypeScript Producer (Node.js Services)

```typescript
// utils/kafkaProducer.ts
import { Kafka, Producer, ProducerRecord } from 'kafkajs';

export class KafkaProducer {
  private producer: Producer;
  private isConnected = false;

  constructor(private kafka: Kafka) {
    this.producer = this.kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000,
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.producer.connect();
      this.isConnected = true;
      console.log('โ… Kafka producer connected');
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.producer.disconnect();
      this.isConnected = false;
      console.log('โ… Kafka producer disconnected');
    }
  }

  async publishEvent<T>(
    topic: string,
    eventType: string,
    data: T,
    key?: string
  ): Promise<void> {
    await this.connect();

    const event = {
      eventId: this.generateEventId(),
      eventType,
      version: '1.0',
      timestamp: new Date().toISOString(),
      source: {
        service: process.env.SERVICE_NAME || 'unknown-service',
        version: process.env.SERVICE_VERSION || '1.0.0',
      },
      data,
    };

    const record: ProducerRecord = {
      topic,
      messages: [{
        key: key || event.eventId,
        value: JSON.stringify(event),
        timestamp: Date.now().toString(),
        headers: {
          eventType,
          version: '1.0',
        },
      }],
    };

    try {
      const result = await this.producer.send(record);
      console.log(`๐“ค Event published to ${topic}:`, {
        eventId: event.eventId,
        partition: result[0].partition,
        offset: result[0].offset,
      });
    } catch (error) {
      console.error('โ Failed to publish event:', error);
      throw error;
    }
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Usage example
const kafka = new Kafka({
  clientId: 'sensor-streamer-service',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
});

const producer = new KafkaProducer(kafka);

// Publish sensor reading
await producer.publishEvent(
  'sensors.device.readings.v1',
  'sensor.reading.created',
  {
    deviceId: 'dev_001',
    farmId: 'farm_001',
    sensorType: 'temperature',
    value: 25.5,
    unit: 'celsius',
  },
  'dev_001' // Use device ID as key for partitioning
);
```

### 2. Python Producer (Python Services)

```python
# utils/kafka_producer.py
from kafka import KafkaProducer
from kafka.errors import KafkaError
import json
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

class KafkaEventProducer:
    def __init__(self, bootstrap_servers: str):
        self.producer = KafkaProducer(
            bootstrap_servers=bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            key_serializer=lambda k: k.encode('utf-8') if k else None,
            acks='all',
            retries=3,
            retry_backoff_ms=100,
            enable_idempotence=True,
            max_in_flight_requests_per_connection=1,
        )
    
    def publish_event(
        self,
        topic: str,
        event_type: str,
        data: Dict[str, Any],
        key: Optional[str] = None
    ) -> None:
        event = {
            "eventId": self._generate_event_id(),
            "eventType": event_type,
            "version": "1.0",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "source": {
                "service": "analytics-worker",
                "version": "1.0.0"
            },
            "data": data
        }
        
        try:
            future = self.producer.send(
                topic,
                value=event,
                key=key or event["eventId"]
            )
            result = future.get(timeout=10)
            print(f"๐“ค Event published to {topic}: {event['eventId']}")
        except KafkaError as e:
            print(f"โ Failed to publish event: {e}")
            raise
    
    def _generate_event_id(self) -> str:
        return f"evt_{int(datetime.utcnow().timestamp() * 1000)}_{uuid.uuid4().hex[:8]}"
    
    def close(self):
        self.producer.close()

# Usage example
producer = KafkaEventProducer("localhost:9092")

producer.publish_event(
    topic="analytics.prediction.v1",
    event_type="analytics.prediction.created",
    data={
        "predictionId": "pred_001",
        "modelId": "weight_prediction_v1",
        "predictedValue": 2.5,
        "confidence": 0.85
    },
    key="pred_001"
)
```

---

## Consumer Patterns

### 1. TypeScript Consumer (Node.js Services)

```typescript
// utils/kafkaConsumer.ts
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';

export interface EventHandler<T = any> {
  (event: T): Promise<void>;
}

export class KafkaConsumer {
  private consumer: Consumer;
  private handlers = new Map<string, EventHandler[]>();

  constructor(
    private kafka: Kafka,
    private groupId: string
  ) {
    this.consumer = this.kafka.consumer({
      groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
      maxBytesPerPartition: 1048576, // 1MB
      maxWaitTimeInMs: 5000,
    });
  }

  async connect(): Promise<void> {
    await this.consumer.connect();
    console.log(`โ… Kafka consumer connected (group: ${this.groupId})`);
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
    console.log('โ… Kafka consumer disconnected');
  }

  async subscribe(topic: string): Promise<void> {
    await this.consumer.subscribe({ topic, fromBeginning: false });
    console.log(`๐“ฅ Subscribed to topic: ${topic}`);
  }

  async run(): Promise<void> {
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
        try {
          const event = JSON.parse(message.value?.toString() || '{}');
          const eventType = event.eventType;
          
          console.log(`๐“จ Received event: ${eventType} from ${topic}`);
          
          const handlers = this.handlers.get(eventType) || [];
          await Promise.all(
            handlers.map(handler => this.handleEvent(handler, event))
          );
        } catch (error) {
          console.error('โ Error processing message:', error);
          // Send to DLQ or handle error appropriately
        }
      },
    });
  }

  onEvent<T>(eventType: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler as EventHandler);
  }

  private async handleEvent(handler: EventHandler, event: any): Promise<void> {
    try {
      await handler(event);
    } catch (error) {
      console.error(`โ Error in event handler for ${event.eventType}:`, error);
      // Implement retry logic or dead letter queue
    }
  }
}

// Usage example
const kafka = new Kafka({
  clientId: 'analytics-stream-service',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
});

const consumer = new KafkaConsumer(kafka, 'analytics-stream-group');

// Register event handlers
consumer.onEvent('sensor.reading.created', async (event) => {
  console.log('Processing sensor reading:', event.data);
  // Process sensor data
});

consumer.onEvent('device.health.updated', async (event) => {
  console.log('Processing device health:', event.data);
  // Update device status
});

// Start consuming
await consumer.connect();
await consumer.subscribe('sensors.device.readings.v1');
await consumer.subscribe('sensors.device.health.v1');
await consumer.run();
```

### 2. Python Consumer (Python Services)

```python
# utils/kafka_consumer.py
from kafka import KafkaConsumer
from kafka.errors import KafkaError
import json
from typing import Dict, Any, Callable
import asyncio
from concurrent.futures import ThreadPoolExecutor

class KafkaEventConsumer:
    def __init__(self, bootstrap_servers: str, group_id: str):
        self.consumer = KafkaConsumer(
            bootstrap_servers=bootstrap_servers,
            group_id=group_id,
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            key_deserializer=lambda m: m.decode('utf-8') if m else None,
            auto_offset_reset='latest',
            enable_auto_commit=True,
            auto_commit_interval_ms=1000,
            max_poll_records=100,
            session_timeout_ms=30000,
            heartbeat_interval_ms=3000,
        )
        self.handlers: Dict[str, list] = {}
        self.executor = ThreadPoolExecutor(max_workers=10)
    
    def subscribe(self, topics: list):
        self.consumer.subscribe(topics)
        print(f"๐“ฅ Subscribed to topics: {topics}")
    
    def on_event(self, event_type: str, handler: Callable):
        if event_type not in self.handlers:
            self.handlers[event_type] = []
        self.handlers[event_type].append(handler)
    
    async def start_consuming(self):
        try:
            for message in self.consumer:
                await self._process_message(message)
        except KafkaError as e:
            print(f"โ Kafka consumer error: {e}")
        finally:
            self.consumer.close()
    
    async def _process_message(self, message):
        try:
            event = message.value
            event_type = event.get('eventType')
            
            print(f"๐“จ Received event: {event_type} from {message.topic}")
            
            if event_type in self.handlers:
                handlers = self.handlers[event_type]
                tasks = [self._handle_event(handler, event) for handler in handlers]
                await asyncio.gather(*tasks, return_exceptions=True)
                
        except Exception as e:
            print(f"โ Error processing message: {e}")
    
    async def _handle_event(self, handler: Callable, event: Dict[str, Any]):
        try:
            if asyncio.iscoroutinefunction(handler):
                await handler(event)
            else:
                await asyncio.get_event_loop().run_in_executor(
                    self.executor, handler, event
                )
        except Exception as e:
            print(f"โ Error in event handler: {e}")

# Usage example
consumer = KafkaEventConsumer("localhost:9092", "analytics-worker-group")

# Register handlers
async def handle_sensor_reading(event):
    print(f"Processing sensor reading: {event['data']}")
    # Process sensor data

async def handle_prediction(event):
    print(f"Processing prediction: {event['data']}")
    # Process prediction

consumer.on_event("sensor.reading.created", handle_sensor_reading)
consumer.on_event("analytics.prediction.created", handle_prediction)

# Start consuming
consumer.subscribe(["sensors.device.readings.v1", "analytics.prediction.v1"])
asyncio.run(consumer.start_consuming())
```

---

## Error Handling and Resilience

### 1. Dead Letter Queue (DLQ) Pattern

```typescript
// utils/dlqHandler.ts
export class DLQHandler {
  constructor(private producer: KafkaProducer) {}

  async sendToDLQ(
    originalTopic: string,
    originalMessage: any,
    error: Error,
    retryCount: number = 0
  ): Promise<void> {
    const dlqTopic = `${originalTopic}.dlq`;
    
    const dlqMessage = {
      ...originalMessage,
      dlqMetadata: {
        originalTopic,
        error: error.message,
        retryCount,
        timestamp: new Date().toISOString(),
      },
    };

    await this.producer.publishEvent(
      dlqTopic,
      'message.dlq.sent',
      dlqMessage,
      originalMessage.eventId
    );

    console.log(`๐“ค Message sent to DLQ: ${dlqTopic}`);
  }
}
```

### 2. Retry Pattern

```typescript
// utils/retryHandler.ts
export class RetryHandler {
  constructor(
    private maxRetries: number = 3,
    private baseDelay: number = 1000
  ) {}

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.maxRetries) {
          console.error(`โ ${context} failed after ${this.maxRetries} attempts:`, lastError);
          throw lastError;
        }
        
        const delay = this.baseDelay * Math.pow(2, attempt - 1);
        console.warn(`โ ๏ธ ${context} attempt ${attempt} failed, retrying in ${delay}ms:`, lastError.message);
        
        await this.sleep(delay);
      }
    }
    
    throw lastError!;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## Monitoring and Observability

### 1. Event Metrics

```typescript
// utils/eventMetrics.ts
import { Counter, Histogram, register } from 'prom-client';

const eventCounter = new Counter({
  name: 'kafka_events_total',
  help: 'Total number of Kafka events processed',
  labelNames: ['topic', 'event_type', 'status'],
});

const eventProcessingTime = new Histogram({
  name: 'kafka_event_processing_duration_seconds',
  help: 'Time spent processing Kafka events',
  labelNames: ['topic', 'event_type'],
});

export function recordEventProcessed(
  topic: string,
  eventType: string,
  status: 'success' | 'error',
  processingTime?: number
): void {
  eventCounter.inc({ topic, event_type: eventType, status });
  
  if (processingTime !== undefined) {
    eventProcessingTime.observe(
      { topic, event_type: eventType },
      processingTime
    );
  }
}
```

### 2. Health Check for Kafka

```typescript
// utils/kafkaHealthCheck.ts
export class KafkaHealthCheck {
  constructor(
    private producer: KafkaProducer,
    private consumer: KafkaConsumer
  ) {}

  async checkHealth(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: {
      producer: boolean;
      consumer: boolean;
      timestamp: string;
    };
  }> {
    const timestamp = new Date().toISOString();
    
    try {
      // Check producer health
      const producerHealthy = await this.checkProducerHealth();
      
      // Check consumer health
      const consumerHealthy = await this.checkConsumerHealth();
      
      const status = producerHealthy && consumerHealthy ? 'healthy' : 'unhealthy';
      
      return {
        status,
        details: {
          producer: producerHealthy,
          consumer: consumerHealthy,
          timestamp,
        },
      };
    } catch (error) {
      console.error('โ Kafka health check failed:', error);
      return {
        status: 'unhealthy',
        details: {
          producer: false,
          consumer: false,
          timestamp,
        },
      };
    }
  }

  private async checkProducerHealth(): Promise<boolean> {
    try {
      // Try to get metadata to check connection
      await this.producer.connect();
      return true;
    } catch {
      return false;
    }
  }

  private async checkConsumerHealth(): Promise<boolean> {
    try {
      // Check if consumer is connected
      return this.consumer.isConnected();
    } catch {
      return false;
    }
  }
}
```

### ๐“ เธเธฒเธฃ Monitor Topics

#### เธ”เธนเธฃเธฒเธขเธเธฒเธฃ Topics
```bash
# เธเนเธฒเธ Docker
docker exec farmiq-kafka kafka-topics.sh --bootstrap-server localhost:9092 --list

# เธเนเธฒเธ Script
./cloud/scripts/create-kafka-topics.sh list
```

#### เธ”เธนเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ” Topic
```bash
# เธเนเธฒเธ Docker
docker exec farmiq-kafka kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic sensors.device.readings.v1

# เธเนเธฒเธ Script
./cloud/scripts/create-kafka-topics.sh describe sensors.device.readings.v1
```

#### เธ”เธน Consumer Groups
```bash
docker exec farmiq-kafka kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list
```

---

## Best Practices

### 1. Event Design
- **Idempotent**: Events should be idempotent to handle duplicates
- **Immutable**: Event data should not be modified after creation
- **Versioned**: Always include version information for schema evolution
- **Self-contained**: Include all necessary data in the event

### 2. Topic Design
- **Partitioning**: Use meaningful keys for partitioning (e.g., device ID, farm ID)
- **Retention**: Set appropriate retention policies based on data importance
- **Compaction**: Use compact topics for master data that needs latest state

### 3. Consumer Design
- **Idempotent Processing**: Ensure consumers can handle duplicate events
- **Error Handling**: Implement proper error handling and DLQ patterns
- **Batch Processing**: Process events in batches for better performance
- **Monitoring**: Add comprehensive monitoring and alerting

### 4. Producer Design
- **Reliability**: Use idempotent producers for exactly-once semantics
- **Batching**: Use batching for better throughput
- **Compression**: Enable compression for large payloads
- **Schema Registry**: Use schema registry for schema evolution

---

## Troubleshooting

### Topic เนเธกเนเธ–เธนเธเธชเธฃเนเธฒเธ
1. เธ•เธฃเธงเธเธชเธญเธเธงเนเธฒ Kafka เธเธฃเนเธญเธกเนเธเนเธเธฒเธ
2. เธ•เธฃเธงเธเธชเธญเธ logs เธเธญเธ kafka-init-topics
3. เธฃเธฑเธ script manual

### Topic เธกเธตเธเนเธญเธกเธนเธฅเนเธกเนเธเธฃเธ
1. เธ•เธฃเธงเธเธชเธญเธ retention policy
2. เธ•เธฃเธงเธเธชเธญเธ consumer groups
3. เธ•เธฃเธงเธเธชเธญเธ partition assignment

### Performance Issues
1. เน€เธเธดเนเธก partitions เธชเธณเธซเธฃเธฑเธ high-volume topics
2. เธเธฃเธฑเธ retention time
3. เธ•เธฃเธงเธเธชเธญเธ consumer lag

### Consumer Lag Issues
1. เน€เธเธดเนเธก consumer instances
2. เธ•เธฃเธงเธเธชเธญเธ processing time
3. เธเธฃเธฑเธ batch size

### Producer Issues
1. เธ•เธฃเธงเธเธชเธญเธ network connectivity
2. เธ•เธฃเธงเธเธชเธญเธ broker configuration
3. เธ•เธฃเธงเธเธชเธญเธ message size limits

---

## ๐“ เธซเธกเธฒเธขเน€เธซเธ•เธธ

- Topics เธเธฐเธ–เธนเธเธชเธฃเนเธฒเธเธญเธฑเธ•เนเธเธกเธฑเธ•เธดเน€เธกเธทเนเธญ start Docker Compose
- เธเธฒเธฃเนเธเนเนเธ topics เธ•เนเธญเธ restart Kafka
- เนเธเน `--if-not-exists` เน€เธเธทเนเธญเธเนเธญเธเธเธฑเธ error เน€เธกเธทเนเธญ topic เธกเธตเธญเธขเธนเนเนเธฅเนเธง
- เธ•เธฃเธงเธเธชเธญเธ logs เน€เธชเธกเธญเน€เธกเธทเนเธญเธกเธตเธเธฑเธเธซเธฒ

## ๐”— เธฅเธดเธเธเนเธ—เธตเนเน€เธเธตเนเธขเธงเธเนเธญเธ

- [Kafka Documentation](https://kafka.apache.org/documentation/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FarmIQ Cloud Documentation](./docs/cloud/)

---

*เน€เธญเธเธชเธฒเธฃเธเธตเนเนเธ”เนเธฃเธฑเธเธเธฒเธฃเธญเธฑเธเน€เธ”เธ•เธฅเนเธฒเธชเธธเธ”: 2024-01-15*
