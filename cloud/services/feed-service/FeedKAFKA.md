# Pub/Sub Messaging Design & Project Structure

Below is a comprehensive design for the Kafka-based pub/sub integration in your `feeds` service, along with a recommended folder structure for your project.

---

## 1. Topics & Events

| Topic Name                     | Event Types                         | Payload Highlights                                                                                                     |
| ------------------------------ | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `feeds.feed_batches`           | `created`, `updated`, `deleted`     | `feedBatchId`, `customerId`, `productionDate`, `formulaId`, `lineNo`, `batchNo`, `feedType`                            |
| `feeds.physical_quality`       | `added`, `updated`, `removed`       | `id`, `feedBatchId`, `propertyName`, `propertyValue`, `unit`                                                           |
| `feeds.chemical_quality`       | `added`, `updated`, `removed`       | `id`, `feedBatchId`, `nutrientName`, `amount`, `unit`                                                                  |
| `feeds.pellet_mill_condition`  | `added`, `updated`, `removed`       | `id`, `feedBatchId`, `parameterName`, `parameterValue`                                                                 |
| `feeds.mixing_condition`       | `added`, `updated`, `removed`       | `id`, `feedBatchId`, `parameterName`, `parameterValue`                                                                 |
| `feeds.grinding_condition`     | `added`, `updated`, `removed`       | `id`, `feedBatchId`, `parameterName`, `parameterValue`                                                                 |
| `feeds.feed_batch_assignments` | `assigned`, `updated`, `unassigned` | `assignmentId`, `feedBatchId`, `farmId`, `houseId`, `animalId`, `assignedStart`, `assignedEnd`, `feedQuantity`, `note` |

**Message Schema** (all events share a common envelope):

```json
{
  "eventId": "UUID",
  "eventType": "entity.action",       // e.g. "feed_batches.created"
  "timestamp": "ISO8601",
  "payload": { ... }                   // entity-specific fields
}
```

---

## 2. Producer Responsibilities

Each service method that alters data should publish an event:

* **Create** → publish `*.created` with full record payload.
* **Update** → publish `*.updated` with changed fields + `id`.
* **Delete** → publish `*.deleted` (for main catalogs) with the composite PK.
* **Assignment** → publish `feed_batch_assignments.assigned`/`unassigned`.

**Example** in `FeedBatchService#create(...)`:

```ts
await this.feedBatchRepository.save(batch);
await this.kafkaProducer.send({
  topic: 'feeds.feed_batches',
  messages: [{
    key: String(batch.feedBatchId),
    value: JSON.stringify({
      eventId: uuid(),
      eventType: 'feed_batches.created',
      timestamp: new Date().toISOString(),
      payload: batch,
    })
  }]
});
```

---

## 3. Consumer Responsibilities

Downstream services can subscribe to:

* Analytics (e.g. quality dashboard)
* Notification service (e.g. anomaly alerts)
* Data warehouse loader

Each consumer should:

1. **Deserialize** the envelope.
2. **Validate** payload schema.
3. **Apply** logic based on `eventType`.

---

## 4. Folder Structure

```
└── src/
    ├── config/                # Kafka, DB, env configs
    │   └── kafka.config.ts
    │   └── ormconfig.ts
    ├── events/                # Schema & topic definitions
    │   ├── index.ts           # exports all topics & eventTypes enums
    │   └── envelope.interface.ts
    ├── models/                # TypeORM entities
    │   ├── feedBatch.model.ts
    │   ├── physicalQuality.model.ts
    │   ├── chemicalQuality.model.ts
    │   └── ...
    ├── kafka/             # Kafka integration folder
│   ├── producer.ts             # wrapper สำหรับส่ง message
│   ├── topics.ts               # รวมชื่อ topic & event constants
│   └── schemas/                # JSON Schema files for event payloads
│       ├── xx.schema.json
│       └── xxx.schema.json
    │   └── quality.consumer.ts
    ├── services/              # Business logic & repositories
    │   ├── feedBatch.service.ts
    │   └── quality.service.ts
    ├── utils/                 # shared helpers (schema validation, uuid, logging)
    ├── index.ts               # app bootstrap
    └── server.ts              # REST or gRPC entrypoint
```

**Notes**:

* Keep `events/` decoupled; both producers and consumers import from it.
* Each producer file handles one topic and defines a `publishEvent(...)` helper.
* Consumers can be in the same service or spun off into a dedicated microservice, depending on scale.

---

This setup ensures clear boundaries between core logic and messaging, makes schemas discoverable, and keeps your code modular and testable. Let me know if you need sample code snippets or deeper dives on any part!

feed_batches.schema.json

physical_quality.schema.json

chemical_quality.schema.json

pellet_mill_condition.schema.json

mixing_condition.schema.json

grinding_condition.schema.json

feed_batch_assignments.schema.json

message_envelope.schema.json