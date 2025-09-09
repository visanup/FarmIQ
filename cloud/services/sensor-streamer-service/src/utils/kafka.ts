// src/utils/kafka.ts
import { Kafka, logLevel, SASLOptions, CompressionTypes, Partitioners } from 'kafkajs';
import { KAFKA_BROKERS, KAFKA_SSL, KAFKA_CLIENT_ID } from '../configs/config';

// ---- log ค่า ENV ดิบ ๆ เพื่อดีบั๊ก ----
console.log('[kafka.config.raw]', JSON.stringify({
  brokers: KAFKA_BROKERS,
  ssl: KAFKA_SSL,
}));

// ---- ตีความ ssl ให้เป็น boolean แท้ ๆ (กันกรณีถูกส่งมาเป็นสตริง) ----
const sslFlag = KAFKA_SSL;

// ---- config ที่ "ถูกใช้จริง" ตอนสร้าง client ----
console.log('[kafka.config.effective]', JSON.stringify({
  brokers: KAFKA_BROKERS,
  ssl: sslFlag,
}));

const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: KAFKA_BROKERS.split(','),
  ssl: sslFlag,
  logLevel: logLevel.INFO,
});

export { CompressionTypes };

export const producer = kafka.producer({
  idempotent: true,
  allowAutoTopicCreation: false,
  // ใช้ LegacyPartitioner เพื่อลดผลกระทบการเปลี่ยน default partitioner ใน v2
  createPartitioner: Partitioners.LegacyPartitioner,
});

export async function initKafka() {
  await producer.connect();
  console.log('✅ Kafka producer connected');
}

export async function shutdownKafka() {
  try {
    await producer.disconnect();
  } catch (e) {
    console.error('⚠️ Kafka disconnect error:', e);
  }
}

// helper เล็ก ๆ เผื่ออยากใช้ส่งข้อความแบบรวม
export async function publish(topic: string, messages: { key?: string | Buffer | null; value: string | Buffer | null; headers?: Record<string, string>; }[]) {
  return producer.send({ topic, messages });
}


