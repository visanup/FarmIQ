//src/services/reading.service.ts

import { AppDataSource } from '../utils/dataSource';
import { Reading } from '../models/Reading';

export const WEIGHT_METRICS = ['weight', 'mass'] as const;
export type WeightMetric = typeof WEIGHT_METRICS[number];

export async function getReadingById(id: string | number) {
  return AppDataSource.getRepository(Reading).findOneByOrFail({ id: String(id) });
}

/** ดึง reading น้ำหนักที่ "ใกล้เวลา t ที่สุด" ภายใน windowMs */
export async function findNearestWeightReading(
  tenantId: string,
  sensorId: string | null,
  t: Date,
  windowMs: number
) {
  const repo = AppDataSource.getRepository(Reading);
  const qb = repo
    .createQueryBuilder('r')
    .where('r.tenant_id = :tenant', { tenant: tenantId })
    .andWhere('(r.sensor_id = :sid OR :sid IS NULL)', { sid: sensorId ?? null })
    .andWhere('r.metric IN (:...metrics)', { metrics: WEIGHT_METRICS })
    .andWhere('r.time BETWEEN :start AND :end', {
      start: new Date(t.getTime() - windowMs),
      end: new Date(t.getTime() + windowMs),
    })
    .orderBy('ABS(EXTRACT(EPOCH FROM (r.time - :t)))', 'ASC')
    .setParameter('t', t)
    .limit(1);

  const reading = await qb.getOne();
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
  return AppDataSource.getRepository(Reading)
    .createQueryBuilder('r')
    .where('r.tenant_id = :tenant', { tenant: tenantId })
    .andWhere('(r.sensor_id = :sid OR :sid IS NULL)', { sid: sensorId ?? null })
    .andWhere('r.metric IN (:...metrics)', { metrics: WEIGHT_METRICS })
    .andWhere('r.time BETWEEN :start AND :end', { start, end })
    .orderBy('r.time', 'ASC')
    .getMany();
}
