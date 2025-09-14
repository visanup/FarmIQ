//src/services/reading.service.ts
import { prisma } from '../utils/prisma';

export const WEIGHT_METRICS = ['weight', 'mass'] as const;
export type WeightMetric = typeof WEIGHT_METRICS[number];

export async function getReadingById(id: string | number) {
  const rows = await (prisma.$queryRawUnsafe(`SELECT * FROM sensors.readings WHERE id=$1`, String(id)) as Promise<any[]>);
  if (!rows[0]) throw new Error('Reading not found');
  return rows[0];
}

/** ดึง reading น้ำหนักที่ "ใกล้เวลา t ที่สุด" ภายใน windowMs */
export async function findNearestWeightReading(
  tenantId: string,
  sensorId: string | null,
  t: Date,
  windowMs: number
) {
  const start = new Date(t.getTime() - windowMs);
  const end = new Date(t.getTime() + windowMs);
  const rows = await (prisma.$queryRawUnsafe(
    `SELECT * FROM sensors.readings r
     WHERE r.tenant_id=$1 AND (r.sensor_id = $2 OR $2 IS NULL)
       AND r.metric = ANY($3)
       AND r.time BETWEEN $4 AND $5
     ORDER BY ABS(EXTRACT(EPOCH FROM (r.time - $6))) ASC
     LIMIT 1`,
    tenantId, sensorId ?? null, WEIGHT_METRICS as any, start, end, t
  ) as Promise<any[]>);
  const reading = rows[0];
  if (!reading) return null;

  const deltaMs = Math.abs(reading.time.getTime() - t.getTime());
  return { reading, deltaMs };
}

/** ดึงหน้าต่างข้อมูลน้ำหนัก (ใช้ตอนอยากคำนวณค่า stable/median เอง) */
export async function getWeightWindow(
  tenantId: string,
  sensorId: string | null,
  start: Date,
  end: Date
) {
  const rows = await (prisma.$queryRawUnsafe(
    `SELECT * FROM sensors.readings r
     WHERE r.tenant_id=$1 AND (r.sensor_id=$2 OR $2 IS NULL)
       AND r.metric = ANY($3) AND r.time BETWEEN $4 AND $5
     ORDER BY r.time ASC`,
    tenantId, sensorId ?? null, WEIGHT_METRICS as any, start, end
  ) as Promise<any[]>);
  return rows as any[];
}
