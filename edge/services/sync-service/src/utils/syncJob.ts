// src/utils/syncJob.ts
import { edgeDataSource, cloudDataSource } from "./dataSource";
import { SweepReading } from "../models/SweepReading";
import { LabReading } from "../models/LabReading";
import { DeviceHealth } from "../models/DeviceHealth";
import { SyncState } from "../models/SyncState";

let isSyncing = false;

type Plan = {
  name: "sensors.sweep_readings" | "sensors.lab_readings" | "sensors.device_health";
  entity: any;
  timeCol: string;
  conflictCols: string[];        // สำหรับ DO NOTHING
  filter?: string;               // เช่น filter tenant
  batch?: number;
};

const TENANT = process.env.SYNC_TENANT?.trim(); // ถ้าระบุจะ filter by tenant

const plans: Plan[] = [
  {
    name: "sensors.sweep_readings",
    entity: SweepReading,
    timeCol: "time",
    conflictCols: ["time","tenant_id","robot_id","run_id","sensor_id","metric"],
    filter: TENANT ? "t.tenant_id = :tenant" : undefined,
    batch: 20000,
  },
  {
    name: "sensors.lab_readings",
    entity: LabReading,
    timeCol: "time",
    conflictCols: ["time","tenant_id","station_id","sensor_id","metric"],
    filter: TENANT ? "t.tenant_id = :tenant" : undefined,
    batch: 10000,
  },
  {
    name: "sensors.device_health",
    entity: DeviceHealth,
    timeCol: "time",
    conflictCols: ["time","tenant_id","device_id"],
    filter: TENANT ? "t.tenant_id = :tenant" : undefined,
    batch: 5000,
  },
];

async function ensureSyncState() {
  await cloudDataSource.query(`
    CREATE TABLE IF NOT EXISTS sync_state(
      table_name text primary key,
      last_ts timestamptz not null default to_timestamp(0)
    );
  `);
}

async function getCursor(table: string) {
  const repo = cloudDataSource.getRepository(SyncState);
  let s = await repo.findOne({ where: { table_name: table } });
  if (!s) {
    s = repo.create({ table_name: table, last_ts: new Date(0) });
    await repo.save(s);
  }
  return s;
}

export async function runSync() {
  if (isSyncing) return;
  isSyncing = true;
  try {
    if (!edgeDataSource.isInitialized) await edgeDataSource.initialize();
    if (!cloudDataSource.isInitialized) await cloudDataSource.initialize();
    await ensureSyncState();

    for (const p of plans) {
      await syncOne(p);
    }
  } catch (err) {
    console.error("❌ Sync error:", err);
  } finally {
    isSyncing = false;
  }
}

async function syncOne(p: Plan) {
  const eRepo = edgeDataSource.getRepository(p.entity);
  const cRepo = cloudDataSource.getRepository(p.entity);
  const sRepo = cloudDataSource.getRepository(SyncState);

  const st = await getCursor(p.name);
  const cursor = new Date(st.last_ts.getTime() - 1); // backoff 1ms

  let qb = eRepo.createQueryBuilder("t")
    .where(`t.${p.timeCol} > :cursor`, { cursor })
    .orderBy(`t.${p.timeCol}`, "ASC")
    .limit(p.batch ?? 10000);
  if (p.filter) qb = qb.andWhere(p.filter, { tenant: TENANT });

  const rows = await qb.getMany();
  if (!rows.length) {
    console.log(`ℹ️ [${p.name}] no new rows`);
    return;
  }

  // ON CONFLICT DO NOTHING ใช้ composite key
  const cols = Object.keys(eRepo.metadata.propertiesMap);
  const values = rows.map(r => cols.map(c => (r as any)[c]));

  const colList = cols.map(c => `"${c}"`).join(",");
  const placeholders = rows
    .map((_, i) => `(${cols.map((__, j) => `$${i * cols.length + j + 1}`).join(",")})`)
    .join(",");

  const conflict = p.conflictCols.map(c => `"${c}"`).join(", ");

  await cRepo.manager.query(
    `INSERT INTO "${eRepo.metadata.schema}"."${eRepo.metadata.tableName}" (${colList})
     VALUES ${placeholders}
     ON CONFLICT (${conflict}) DO NOTHING`,
    values.flat()
  );

  const last = (rows as any[])[rows.length - 1][p.timeCol] as Date;
  await sRepo.save({ table_name: p.name, last_ts: last });

  console.log(`✅ [${p.name}] synced ${rows.length} rows > ${cursor.toISOString()}`);
}
