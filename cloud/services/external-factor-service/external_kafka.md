# External Factors Kafka Integration

## Folder Structure

```
external-factor-service/
├── kafka/                  # Kafka integration layer
│   ├── producer.ts         # Generic wrapper for sending messages
│   ├── topics.ts           # Topic and event constant definitions
│   └── schemas/            # JSON schemas for message validation
```

เอกสารนี้อธิบายขั้นตอนการสร้างและส่งข้อมูล `external_factors` เข้า Kafka พร้อมตัวอย่างโค้ดสำหรับ **TypeScript/Node.js** โดยใช้ไลบรารี่ `kafkajs` หรือไลบรารีที่คล้ายกัน

## 1. ภาพรวม (Overview)

* **Service**: external-factor-service (microservice)
* **Schema**: ตาราง `external_factors.external_factors` ใน PostgreSQL
* **Kafka Topic**: `external.factors` (ตั้งชื่อตาม convention)
* **Message Key**: `customer_id` หรือ `id` เพื่อคงลำดับและคีย์เชิงธุรกิจ
* **Message Value**: JSON payload ตามโครงสร้างข้อมูล

## 2. Kafka Configuration

```jsonc
// ตัวอย่างไฟล์ config.kafka.ts
export const kafkaConfig = {
  clientId: 'external-factor-service',
  brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
  topic: 'external.factors',
};
```

## 3. โครงสร้าง Schema ของ Message

Message payload จะประกอบด้วยฟิลด์สำคัญ ดังนี้:

```json
{
  "id": 123,
  "customer_id": 456,
  "farm_id": 789,
  "batch_id": "batch-20250716",
  "feed_assignment_id": 321,
  "weather": { /* JSONB */ },
  "disease_alert": { /* JSONB */ },
  "market_price": { /* JSONB */ },
  "feed_supply": { /* JSONB */ },
  "weather_forecast": { /* JSONB */ },
  "disease_risk_score": 0.85,
  "regulatory_changes": "Some text",
  "record_date": "2025-07-16",
  "created_at": "2025-07-16T12:34:56.789Z",
  "updated_at": "2025-07-16T12:34:56.789Z"
}
```

## 4. Message Envelope

หากต้องการควบคุม metadata เพิ่มเติม เช่น traceId, source, eventType สามารถใช้โครงสร้าง Envelope ดังนี้:

```ts
interface MessageEnvelope<T> {
  traceId: string;
  timestamp: string; // ISO string
  source: string;    // 'external-factor-service'
  eventType: string; // 'external_factors.created' | 'external_factors.updated'
  data: T;
}
```

## 5. Example: Producer Implementation (TypeScript + kafkajs)

```ts
import { Kafka } from 'kafkajs';
import { kafkaConfig } from './config.kafka';
import { MessageEnvelope } from './events/envelope.interface';
import { ExternalFactors } from './models/externalFactors.model';

// สร้าง instance ของ Kafka
const kafka = new Kafka({
  clientId: kafkaConfig.clientId,
  brokers: kafkaConfig.brokers,
});
const producer = kafka.producer();

async function sendExternalFactorEvent(
  eventType: 'external_factors.created' | 'external_factors.updated',
  payload: ExternalFactors
) {
  const envelope: MessageEnvelope<ExternalFactors> = {
    traceId: generateTraceId(),
    timestamp: new Date().toISOString(),
    source: kafkaConfig.clientId,
    eventType,
    data: payload,
  };

  await producer.connect();
  await producer.send({
    topic: kafkaConfig.topic,
    messages: [
      {
        key: String(payload.customer_id),
        value: JSON.stringify(envelope),
      },
    ],
  });
  await producer.disconnect();
}

function generateTraceId(): string {
  return Math.random().toString(36).slice(2) + Date.now();
}
```

### 5.1 สถานที่เรียกใช้

* เมื่อมีการ `INSERT` ลงตาราง `external_factors`
* เมื่อมีการ `UPDATE` ข้อมูลสำคัญ เช่น `weather`, `disease_alert`

สามารถทำได้ใน Service Layer หลังจากบันทึกลงฐานข้อมูล:

```ts
const saved = await externalFactorsRepo.save(newRecord);
await sendExternalFactorEvent('external_factors.created', saved);
```

## 6. การตั้ง Partition และ Key

* ใช้ `key` เป็น `customer_id` เพื่อให้ข้อความของลูกค้าเดียวกันอยู่ใน partition เดียวกัน
* Partition count: ตั้งค่าตาม Throughput และ Scalability เช่น 3-6 partitions

## 7. Best Practices

* **Idempotency**: ตรวจสอบ `id` ก่อน process ซ้ำ
* **Error Handling**: retry logic ใน `producer.send()` และ log ข้อความ error
* **Schema Validation**: ใช้ JSON Schema ตรวจ payload ก่อนส่ง
* **Monitoring**: ตั้ง metric สำหรับจำนวน message sent, error rate

## 8. Troubleshooting

| ปัญหา                   | สาเหตุทั่วไป                                   | แนวทางแก้ไข                                  |
| ----------------------- | ---------------------------------------------- | -------------------------------------------- |
| Broker unreachable      | Broker list ผิดพลาด หรือ network issue         | ตรวจ `KAFKA_BROKERS` และ network             |
| Timeout sending message | Broker overloaded หรือ timeout configs ต่ำเกิน | เพิ่ม `request.timeout.ms` และ scale brokers |
| Invalid JSON payload    | Object มี circular reference                   | แปลง payload ให้เป็น plain JSON              |

---

> เอกสารนี้ช่วยให้ทีมเข้าใจวิธีการผลิต (produce) ข้อมูล `external_factors` เข้า Kafka ได้อย่างถูกต้องและปลอดภัย
