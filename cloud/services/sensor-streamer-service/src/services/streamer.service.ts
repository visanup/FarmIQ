// src/services/streamer.service.ts

import { AppDataSource } from '../utils/dataSource';
import { DeviceReading } from '../models/DeviceReading';
import { LabReading } from '../models/LabReading';
import { SweepReading } from '../models/SweepReading';
import { DeviceHealth } from '../models/DeviceHealth';
import { StreamState } from '../models/StreamState';
import { producer } from '../utils/kafka';
import { KAFKA, STREAMER } from '../configs/config';

type Plan<Row> = {
  table: 'sensors.device_readings' | 'sensors.lab_readings' | 'sensors.sweep_readings' | 'sensors.device_health';
  entity: any;
  topic: string;
  orderCols: string[];                 // ลำดับคีย์: time + PK components
  partKey: (r: Row) => string;         // partition key
  toMessage: (r: Row) => any;          // serialize
  tenantCol: string;                   // ชื่อคอลัมน์ tenant ในตาราง
};

const plans: Plan<any>[] = [
  {
    table: 'sensors.device_readings',
    entity: DeviceReading,
    topic: KAFKA.topics.deviceReadings,
    orderCols: ['time', 'tenant_id', 'device_id', 'metric'],
    partKey: (r: DeviceReading) => `${r.tenant_id}:${r.device_id}`,
    tenantCol: 'tenant_id',
    toMessage: (r: DeviceReading) => ({
      schema: 'sensor.device.v1',
      ts: r.time.toISOString(),
      tenant_id: r.tenant_id,
      device_id: r.device_id,
      metric: r.metric,
      value: r.value,
      quality: r.quality,
      sensor_id: r.sensor_id ?? null,
      payload: r.payload ?? {},
    }),
  },
  {
    table: 'sensors.device_health',
    entity: DeviceHealth,
    topic: KAFKA.topics.deviceHealth,
    orderCols: ['time', 'tenant_id', 'device_id'],
    partKey: (r: DeviceHealth) => `${r.tenant_id}:${r.device_id}`,
    tenantCol: 'tenant_id',
    toMessage: (r: DeviceHealth) => ({
      schema: 'sensor.health.v1',
      ts: r.time.toISOString(),
      tenant_id: r.tenant_id,
      device_id: r.device_id,
      online: r.online ?? null,
      rssi: r.rssi ?? null,
      uptime_s: r.uptime_s ?? null,
      source: r.source ?? null,
      meta: r.meta ?? {},
    }),
  },
  {
    table: 'sensors.lab_readings',
    entity: LabReading,
    topic: KAFKA.topics.labReadings,
    orderCols: ['time', 'tenant_id', 'station_id', 'sensor_id', 'metric'],
    partKey: (r: LabReading) => `${r.tenant_id}:${r.station_id}`,
    tenantCol: 'tenant_id',
    toMessage: (r: LabReading) => ({
      schema: 'sensor.lab.v1',
      ts: r.time.toISOString(),
      tenant_id: r.tenant_id,
      station_id: r.station_id,
      sensor_id: r.sensor_id,
      metric: r.metric,
      value: r.value,
      quality: r.quality,
      payload: r.payload ?? {},
    }),
  },
  {
    table: 'sensors.sweep_readings',
    entity: SweepReading,
    topic: KAFKA.topics.sweepReadings,
    orderCols: ['time', 'tenant_id', 'robot_id', 'run_id', 'sensor_id', 'metric'],
    partKey: (r: SweepReading) => `${r.tenant_id}:${r.robot_id}:${r.run_id}`,
    tenantCol: 'tenant_id',
    toMessage: (r: SweepReading) => ({
      schema: 'sensor.sweep.v1',
      ts: r.time.toISOString(),
      tenant_id: r.tenant_id,
      robot_id: r.robot_id,
      run_id: r.run_id,
      sensor_id: r.sensor_id,
      metric: r.metric,
      zone_id: r.zone_id ?? null,
      x: r.x ?? null,
      y: r.y ?? null,
      value: r.value,
      quality: r.quality,
      payload: r.payload ?? {},
    }),
  },
];

/** อ่าน/สร้างคอร์สเซอร์ของตารางหนึ่ง ๆ โดยใช้ name/last_time/last_key */
async function getState(name: string) {
  const repo = AppDataSource.getRepository(StreamState);
  let st = await repo.findOne({ where: { name } });
  if (!st) {
    st = repo.create({
      name,
      last_time: new Date(0),
      last_key: null,
      tenant_id: null,
      robot_id: null,
      run_id: null,
      sensor_id: null,
      metric: null,
    } as Partial<StreamState>);
    await repo.save(st);
  }
  return st;
}

async function setState(name: string, last_time: Date, last_key: Record<string, any>) {
  const repo = AppDataSource.getRepository(StreamState);

  // อัปเดตฟิลด์ที่มีใน schema เพื่อให้อ่านง่ายตอน debug (ถ้ามี)
  const patch: Partial<StreamState> = {
    name,
    last_time,
    last_key,
  };
  for (const k of ['tenant_id', 'robot_id', 'run_id', 'sensor_id', 'metric'] as const) {
    if (k in last_key) (patch as any)[k] = (last_key as any)[k];
  }
  await repo.save(patch);
}

/** สร้างเงื่อนไข lexicographic: (time, k1, k2, ...) > (:time, :k1, :k2, ...) */
function lexicographicWhere(alias: string, cols: string[], params: any) {
  const left = '(' + cols.map((c) => `${alias}.${c}`).join(',') + ')';
  const right = '(' + cols.map((c) => `:${c}`).join(',') + ')';
  return { clause: `${left} > ${right}`, params };
}

/** เติมค่าเริ่มต้นต่ำสุดให้คีย์ ถ้ายังไม่มีใน last_key */
function fillKeyDefaults(cols: string[], base: Record<string, any>) {
  const out = { ...base };
  for (const c of cols) {
    if (c === 'time') continue;
    if (!(c in out)) {
      out[c] = c === 'run_id' ? 0 : ''; // run_id เป็น bigint, ที่เหลือเป็น text
    }
  }
  return out;
}

/** ขยับ stream หนึ่งแผน */
export async function streamPlanOnce(p: Plan<any>) {
  const repo = AppDataSource.getRepository(p.entity);
  const st = await getState(p.table);

  const horizon = new Date(Date.now() - STREAMER.maxLagSeconds * 1000);

  // baseKey = last_time + last_key (generic)
  const baseKey0: Record<string, any> = {
    time: (st.last_time ?? new Date(0)).toISOString(),
    ...(st.last_key ?? {}),
  };
  const baseKey = fillKeyDefaults(p.orderCols, baseKey0);

  let qb = repo.createQueryBuilder('t').andWhere('t.time <= :horizon', { horizon }).limit(STREAMER.batchSize);

  // order by หลายคอลัมน์ (ใช้ addOrderBy ไล่ทีละตัว)
  qb = qb.orderBy(`t.${p.orderCols[0]}`, 'ASC');
  for (let i = 1; i < p.orderCols.length; i++) qb = qb.addOrderBy(`t.${p.orderCols[i]}`, 'ASC');

  // tenant filter
  if (STREAMER.tenantFilter?.length) {
    qb = qb.andWhere(`t.${p.tenantCol} = ANY(:tenants)`, { tenants: STREAMER.tenantFilter });
  }

  // lexicographic cursor
  const { clause, params } = lexicographicWhere('t', p.orderCols, baseKey);
  qb = qb.andWhere(clause, params);

  const rows = await qb.getMany();
  if (rows.length === 0) return { table: p.table, count: 0 };

  const messages = rows.map((r: any) => ({
    key: p.partKey(r),
    value: JSON.stringify(p.toMessage(r)),
    headers: { 'content-type': 'application/json' },
  }));

  await producer.send({ topic: p.topic, messages, compression: 1 });

  // อัปเดตคอร์สเซอร์เป็นค่าของแถวสุดท้าย
  const last: any = rows[rows.length - 1];
  const lastKey: Record<string, any> = {};
  for (const c of p.orderCols) lastKey[c] = last[c];
  await setState(p.table, new Date(lastKey.time), { ...lastKey, time: undefined });

  return { table: p.table, count: rows.length };
}

let timer: NodeJS.Timeout | null = null;

export function startStreamerLoop() {
  if (timer) return;
  const loop = async () => {
    try {
      for (const p of plans) {
        const r = await streamPlanOnce(p);
        if ((r as any).count) console.log(`→ [${(r as any).table}] published ${(r as any).count}`);
      }
    } catch (e) {
      console.error('streamer error:', e);
    } finally {
      timer = setTimeout(loop, STREAMER.pollIntervalMs);
    }
  };
  loop();
}

export function stopStreamerLoop() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

