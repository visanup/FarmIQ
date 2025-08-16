// src/utils/syncJob.ts
import { edgeDataSource, cloudDataSource } from "./dataSource";
import { SweepReading } from "../models/SweepReading";
import { LabReading } from "../models/LabReading";
import { DeviceReading } from "../models/DeviceReading";
import { DeviceHealth } from "../models/DeviceHealth";
import { SyncState } from "../models/SyncState";

let isSyncing = false;

type Plan = {
  name:
    | "sensors.sweep_readings"
    | "sensors.lab_readings"
    | "sensors.device_readings"
    | "sensors.device_health";
  entity: any;
  timeCol: string;
  filter?: string;
  batch?: number;
  order: number;
};

const TENANT = process.env.SYNC_TENANT?.trim();
const BATCH_SWEEP = Number(process.env.SYNC_BATCH_SWEEP ?? 20000);
const BATCH_LAB = Number(process.env.SYNC_BATCH_LAB ?? 10000);
const BATCH_DEVICE = Number(process.env.SYNC_BATCH_DEVICE ?? 20000);
const BATCH_HEALTH = Number(process.env.SYNC_BATCH_HEALTH ?? 5000);

const plans: Plan[] = [
  {
    name: "sensors.sweep_readings",
    entity: SweepReading,
    timeCol: "time",
    filter: TENANT ? "t.tenant_id = :tenant" : undefined,
    batch: BATCH_SWEEP,
    order: 2,
  },
  {
    name: "sensors.lab_readings",
    entity: LabReading,
    timeCol: "time",
    filter: TENANT ? "t.tenant_id = :tenant" : undefined,
    batch: BATCH_LAB,
    order: 2,
  },
  {
    name: "sensors.device_readings",
    entity: DeviceReading,
    timeCol: "time",
    filter: TENANT ? "t.tenant_id = :tenant" : undefined,
    batch: BATCH_DEVICE,
    order: 2,
  },
  {
    name: "sensors.device_health",
    entity: DeviceHealth,
    timeCol: "time",
    filter: TENANT ? "t.tenant_id = :tenant" : undefined,
    batch: BATCH_HEALTH,
    order: 3,
  },
];

/** ensure sync_state exists on cloud */
async function ensureSyncState() {
  await cloudDataSource.query(`
    CREATE TABLE IF NOT EXISTS sync_state(
      table_name text primary key,
      last_ts timestamptz not null default to_timestamp(0)
    );
  `);
}

async function getCursor(table: string): Promise<Date> {
  const repo = cloudDataSource.getRepository(SyncState);
  let st = await repo.findOne({ where: { table_name: table } });
  if (!st) {
    st = repo.create({ table_name: table, last_ts: new Date(0) });
    await repo.save(st);
  }
  // backoff 1ms กันตกหล่น
  return new Date(st.last_ts.getTime() - 1);
}

async function setCursor(table: string, ts: Date) {
  const repo = cloudDataSource.getRepository(SyncState);
  await repo.save({ table_name: table, last_ts: ts });
}

/** ดึงทีละชุดจนหมดช่วง (loop แบบค่อยๆ ขยับ cursor) */
async function syncOne(p: Plan) {
  const edgeRepo = edgeDataSource.getRepository(p.entity);
  const cloudRepo = cloudDataSource.getRepository(p.entity);

  let cursor = await getCursor(p.name);
  const batch = p.batch ?? 10000;
  let total = 0;

  for (;;) {
    let qb = edgeRepo
      .createQueryBuilder("t")
      .where(`t.${p.timeCol} > :cursor`, { cursor })
      .orderBy(`t.${p.timeCol}`, "ASC")
      .limit(batch);

    if (p.filter) qb = qb.andWhere(p.filter, { tenant: TENANT });

    const rows = await qb.getMany();
    if (!rows.length) {
      if (total === 0) {
        console.log(`ℹ️ [${p.name}] no new rows`);
      } else {
        console.log(`✅ [${p.name}] synced total ${total} rows`);
      }
      break;
    }

    // ใช้ INSERT ... ON CONFLICT DO NOTHING (TypeORM: orIgnore()) เพื่อรองรับ composite PK + generated columns
    await cloudRepo.createQueryBuilder().insert().values(rows as any).orIgnore().execute();

    total += rows.length;
    // อัปเดตคอร์สเซอร์เป็นเวลาแถวสุดท้ายของชุดนี้
    const last = (rows as any[])[rows.length - 1][p.timeCol] as Date;
    cursor = last;
    await setCursor(p.name, last);
  }
}

export async function runSync() {
  if (isSyncing) return;
  isSyncing = true;
  try {
    if (!edgeDataSource.isInitialized) await edgeDataSource.initialize();
    if (!cloudDataSource.isInitialized) await cloudDataSource.initialize();
    await ensureSyncState();

    for (const plan of plans.sort((a, b) => a.order - b.order)) {
      await syncOne(plan);
    }
  } catch (err) {
    console.error("❌ Sync error:", err);
  } finally {
    isSyncing = false;
  }
}

