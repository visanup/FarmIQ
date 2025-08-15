# Formula Kafka Integration Guide

This guide outlines the Kafka integration for the **Formulas** module. It covers:

* Folder structure within the service
* Topic and event definitions
* JSON schema organization
* Producer wrapper usage
* Sample publish logic

---

## 1. Folder Structure

Organize your service repository as follows:

```
project-root/
├── src/
│   ├── services/
│   │   └── formulas/           # Your formula service code
│   └── kafka/                  # Kafka integration layer
│       ├── producer.ts         # Generic wrapper for sending messages
│       ├── topics.ts           # Topic and event constant definitions
│       └── schemas/            # JSON Schema files for payload validation
│           ├── formula.created.schema.json
│           ├── formula.updated.schema.json
│           ├── formula.deleted.schema.json
│           ├── formula_composition.created.schema.json
│           ├── formula_composition.updated.schema.json
│           ├── formula_composition.deleted.schema.json
│           ├── formula_energy.created.schema.json
│           ├── formula_energy.updated.schema.json
│           ├── formula_energy.deleted.schema.json
│           ├── formula_nutrition.created.schema.json
│           ├── formula_nutrition.updated.schema.json
│           ├── formula_nutrition.deleted.schema.json
│           ├── formula_additional.created.schema.json
│           ├── formula_additional.updated.schema.json
│           └── formula_additional.deleted.schema.json
└── package.json
```

> **Note:** Use `*.created`, `*.updated`, and `*.deleted` suffixes for CRUD events.

---

## 2. Topics & Event Constants

Define all topic names and event types in `src/kafka/topics.ts`:

```ts
// src/kafka/topics.ts
export const TOPICS = {
  FORMULA_CREATED: 'formulas.formula.created',
  FORMULA_UPDATED: 'formulas.formula.updated',
  FORMULA_DELETED: 'formulas.formula.deleted',

  COMPOSITION_CREATED: 'formulas.formula_composition.created',
  COMPOSITION_UPDATED: 'formulas.formula_composition.updated',
  COMPOSITION_DELETED: 'formulas.formula_composition.deleted',

  ENERGY_CREATED: 'formulas.formula_energy.created',
  ENERGY_UPDATED: 'formulas.formula_energy.updated',
  ENERGY_DELETED: 'formulas.formula_energy.deleted',

  NUTRITION_CREATED: 'formulas.formula_nutrition.created',
  NUTRITION_UPDATED: 'formulas.formula_nutrition.updated',
  NUTRITION_DELETED: 'formulas.formula_nutrition.deleted',

  ADDITIONAL_CREATED: 'formulas.formula_additional.created',
  ADDITIONAL_UPDATED: 'formulas.formula_additional.updated',
  ADDITIONAL_DELETED: 'formulas.formula_additional.deleted',
};
```

---

## 3. JSON Schemas

Place each event payload schema under `src/kafka/schemas/`. This ensures payloads conform to expected structures before publishing.

Example schema: `formula.created.schema.json`

```json
{
  "$id": "formula.created",
  "type": "object",
  "properties": {
    "formula_id": { "type": "integer" },
    "formula_no": { "type": "string" },
    "name": { "type": "string" },
    "description": { "type": ["string", "null"] },
    "created_at": { "type": "string", "format": "date-time" }
  },
  "required": ["formula_id", "formula_no", "name", "created_at"]
}
```

Repeat similarly for `.updated` and `.deleted` schemas, adjusting properties (e.g., include `updated_at` for updates).

---

## 4. Producer Wrapper

Implement a generic producer in `producer.ts`:

```ts
// src/kafka/producer.ts
import { Kafka, Producer } from 'kafkajs';
import { TOPICS } from './topics';

const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER!] });
const producer: Producer = kafka.producer();

export async function initProducer() {
  await producer.connect();
}

export async function publish(topic: string, message: object) {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
}
```

Call `initProducer()` once during application startup.

---

## 5. Sample Publish Logic

In your formulas service, after each DB operation, publish the corresponding event:

```ts
import { publish } from '../kafka/producer';
import { TOPICS } from '../kafka/topics';

// Example: after creating a new formula
async function createFormula(data: CreateFormulaDto) {
  const newRecord = await formulaRepo.save(data);

  const payload = {
    formula_id: newRecord.formula_id,
    formula_no: newRecord.formula_no,
    name: newRecord.name,
    description: newRecord.description,
    created_at: newRecord.created_at.toISOString(),
  };

  await publish(TOPICS.FORMULA_CREATED, payload);
  return newRecord;
}
```

Implement similar publish calls for update and delete operations, adapting payloads and using the appropriate `TOPICS` constant.

---

## 6. Validation (Optional)

Before publishing, you can validate the message against the JSON schema using a library like `ajv`:

```ts
import Ajv from 'ajv';
import schema from './schemas/formula.created.schema.json';

const ajv = new Ajv();
const validate = ajv.compile(schema);

function validatePayload(payload: object) {
  if (!validate(payload)) {
    console.error(validate.errors);
    throw new Error('Invalid payload for formula.created');
  }
}

// In publish logic:
validatePayload(payload);
await publish(...);
```

---

## 7. Conclusion

With this setup:

1. **Folder Structure** ensures separation of concerns.
2. **Topics** standardize event names.
3. **Schemas** enforce payload contracts.
4. **Producer** abstracts Kafka API calls.
5. **Publish Logic** ties DB operations to events.

You now have a complete blueprint to add Kafka-based pub‑sub to your Formulas service.
