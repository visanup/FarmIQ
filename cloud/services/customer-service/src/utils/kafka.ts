// src/utils/kafka.ts
import { Kafka } from 'kafkajs';

let producer: import('kafkajs').Producer | null = null;

function getProducer() {
  if (producer) return producer;
  const brokers = process.env.KAFKA_BROKERS;
  if (!brokers) return null;
  const kafka = new Kafka({ clientId: 'customer-service', brokers: brokers.split(',') });
  producer = kafka.producer();
  return producer;
}

export async function publishCustomerEvent(type: 'created'|'updated'|'deleted', payload: any) {
  const p = getProducer(); if (!p) return;
  await p.connect().catch(() => {});
  await p.send({
    topic: `customer.${type}.v1`,
    messages: [{ key: String(payload.customer_id ?? ''), value: JSON.stringify({ type, at: new Date().toISOString(), payload }) }],
  });
}

