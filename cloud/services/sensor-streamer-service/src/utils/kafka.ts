// src/utils/kafka.ts
import { Kafka, logLevel, SASLOptions, CompressionTypes, Partitioners } from 'kafkajs';
import { KAFKA } from '../configs/config';

// ---- log ค่า ENV ดิบ ๆ เพื่อดีบั๊ก ----
console.log('[kafka.config.raw]', JSON.stringify({
  brokers: KAFKA.brokers,
  ssl: (KAFKA as any).ssl,
  sasl: KAFKA.sasl ? { mechanism: (KAFKA.sasl as any).mechanism } : undefined,
}));

// ---- ตีความ ssl ให้เป็น boolean แท้ ๆ (กันกรณีถูกส่งมาเป็นสตริง) ----
const sslFlag =
  typeof (KAFKA as any).ssl === 'string'
    ? (KAFKA as any).ssl.toLowerCase() === 'true'
    : !!(KAFKA as any).ssl;

// ---- ประกอบ SASL ให้ตรง type ของ kafkajs แบบปลอดภัย ----
type SaslMech = 'plain' | 'scram-sha-256' | 'scram-sha-512';
let sasl: SASLOptions | undefined;
if (KAFKA.sasl && (KAFKA.sasl as any).mechanism) {
  const mech = (KAFKA.sasl as any).mechanism as SaslMech;
  const user = (KAFKA.sasl as any).username;
  const pass = (KAFKA.sasl as any).password;
  if (user && pass && (mech === 'plain' || mech === 'scram-sha-256' || mech === 'scram-sha-512')) {
    sasl = { mechanism: mech, username: user, password: pass };
  }
}

// ---- config ที่ “ถูกใช้จริง” ตอนสร้าง client ----
console.log('[kafka.config.effective]', JSON.stringify({
  brokers: KAFKA.brokers,
  ssl: sslFlag,
  sasl: sasl ? { mechanism: sasl.mechanism } : undefined,
}));

const kafka = new Kafka({
  clientId: KAFKA.clientId,
  brokers: KAFKA.brokers,     // เช่น ["kafka:9092"]
  ssl: sslFlag,               // ค่า effective ตามที่คำนวณ
  sasl,                       // undefined ถ้าไม่ตั้งค่า
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


