## Overview

This document describes how the **economic-service** publishes economic data events to Kafka. It covers:

1. **Folder Structure** – where Kafka-related code and schema files live
2. **Topics & Event Constants** – topic names and event types
3. **JSON Schemas** – message validation schemas for economic events

Use this guide to understand, extend, or troubleshoot the Kafka integration for economic data.

---

## 1. Folder Structure

```bash
economic-service/
├── src/
│   ├── kafka/
│   │   ├── producer.ts          # Kafka producer wrapper
│   │   ├── topics.ts            # Topic names & event constants
│   │   └── schemas/             # JSON schema definitions
│   │       ├── economic_data.created.schema.json
│   │       ├── economic_data.updated.schema.json
│   │       └── economic_data.deleted.schema.json
│   ├── models/
│   │   └── economicData.model.ts
│   ├── services/
│   │   └── economicData.service.ts  # Business logic, calls producer
│   └── utils/
│       └── kafkaClient.ts      # Shared Kafka client configuration
└── package.json
```

* **producer.ts**: wraps `kafkajs` producer, handles connects, retries, and send logic.
* **topics.ts**: centralizes topic names and event identifiers.
* **schemas/**: holds JSON Schema files to validate outgoing messages before publishing.

---

## 2. Topics & Event Constants

Maintain a single source of truth for all Kafka topics and event types in `src/kafka/topics.ts`:

```typescript
// src/kafka/topics.ts
export const TOPICS = {
  ECONOMIC_DATA: 'farms.economic_data',
};

export const ECONOMIC_EVENTS = {
  CREATED: 'economic_data.created',
  UPDATED: 'economic_data.updated',
  DELETED: 'economic_data.deleted',
};
```

* **TOPICS.ECONOMIC\_DATA**: the Kafka topic name.
* **ECONOMIC\_EVENTS**: suffixes appended to the topic for logical event typing (used as `message.event`).

In producer calls, you’ll use:

```ts
producer.send({
  topic: TOPICS.ECONOMIC_DATA,
  messages: [{
    key: `${record.id}`,
    value: JSON.stringify(payload),
    headers: { event: ECONOMIC_EVENTS.CREATED }
  }]
});
```

---

## 3. JSON Schemas

Schemas live under `src/kafka/schemas/`. Each schema validates the event payload shape.

### Example: economic\_data.created.schema.json

```json
{
  "$id": "https://cerabratechai.com/schemas/economic_data.created.schema.json",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "EconomicDataCreated",
  "type": "object",
  "properties": {
    "id":            { "type": "integer" },
    "customer_id":   { "type": "integer" },
    "farm_id":       { "type": "integer" },
    "batch_id":      { "type": ["string", "null"] },
    "feed_assignment_id": { "type": ["integer", "null"] },
    "cost_type":     { "type": "string" },
    "amount":        { "type": "number" },
    "animal_price":  { "type": ["number", "null"] },
    "feed_cost":     { "type": ["number", "null"] },
    "labor_cost":    { "type": ["number", "null"] },
    "utility_cost":  { "type": ["number", "null"] },
    "medication_cost": { "type": ["number", "null"] },
    "maintenance_cost":{ "type": ["number", "null"] },
    "other_costs":   { "type": ["number", "null"] },
    "record_date":   { "type": "string", "format": "date" },
    "created_at":    { "type": "string", "format": "date-time" },
    "updated_at":    { "type": "string", "format": "date-time" }
  },
  "required": [
    "id", "customer_id", "farm_id", "cost_type", "amount", "record_date", "created_at", "updated_at"
  ]
}
```

Include similar schemas for **.updated** and **.deleted** events; the `deleted` schema may only require `id`, `customer_id`, `record_date`, and `event_timestamp` fields.

---

## 4. Integration Flow

1. **Service Layer**: In `economicData.service.ts`, after persisting to the DB, call the Kafka producer.
2. **Payload Validation**: Producer loads the appropriate JSON schema and validates the payload using a JSON schema validator (e.g., `ajv`).
3. **Publishing**: On successful validation, send the message to Kafka with the correct topic, key, and headers.
4. **Error Handling**: If validation or send fails, log and retry according to configured policies.

---

*For detailed implementation samples or troubleshooting, refer to `producer.ts` and the `ajv` validation utility in `utils/ajvValidator.ts`.*
