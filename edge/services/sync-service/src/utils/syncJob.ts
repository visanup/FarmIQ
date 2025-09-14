// src/utils/syncJob.ts
import { edgeDataSource } from "./dataSource";
import apiClient from "./apiClient";
import { SYNC_MAX_RETRIES, SYNC_BACKOFF_MS } from "../configs/config";
import { SweepReading } from "../models/SweepReading";
import { LabReading } from "../models/LabReading";
import { DeviceReading } from "../models/DeviceReading";
import { DeviceHealth } from "../models/DeviceHealth";

let isSyncing = false;

type Plan = {
  name:
    | "sensors.sweep_readings"
    | "sensors.lab_readings"
    | "sensors.device_readings"
    | "sensors.device_health";
  entity: any;
  timeCol: string;
  endpoint: string;
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
    endpoint: "/sweep-readings",
    filter: TENANT ? "t.tenant_id = :tenant" : undefined,
    batch: BATCH_SWEEP,
    order: 2,
  },
  {
    name: "sensors.lab_readings",
    entity: LabReading,
    timeCol: "time",
    endpoint: "/lab-readings",
    filter: TENANT ? "t.tenant_id = :tenant" : undefined,
    batch: BATCH_LAB,
    order: 2,
  },
  {
    name: "sensors.device_readings",
    entity: DeviceReading,
    timeCol: "time",
    endpoint: "/sensor-readings",
    filter: TENANT ? "t.tenant_id = :tenant" : undefined,
    batch: BATCH_DEVICE,
    order: 2,
  },
  {
    name: "sensors.device_health",
    entity: DeviceHealth,
    timeCol: "time",
    endpoint: "/device-health",
    filter: TENANT ? "t.tenant_id = :tenant" : undefined,
    batch: BATCH_HEALTH,
    order: 3,
  },
];

async function getCursor(endpoint: string): Promise<Date> {
  try {
    const response = await apiClient.get<{ last_ts: string }>(`${endpoint}/latest-timestamp`);
    const lastTs = new Date(response.data.last_ts);
    // backoff 1ms กันตกหล่น
    return new Date(lastTs.getTime() - 1);
  } catch (error) {
    console.error(`Error fetching cursor for ${endpoint}:`, error);
    // Return a very old date on error to be safe
    return new Date(0);
  }
}

/** ดึงทีละชุดจนหมดช่วง (loop แบบค่อยๆ ขยับ cursor) */
async function syncOne(p: Plan) {
  const edgeRepo = edgeDataSource.getRepository(p.entity);

  let cursor = await getCursor(p.endpoint);
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

    try {
      // Map edge rows to cloud DTOs per endpoint
      let payload: any[] = [];
      if (p.endpoint === '/sensor-readings') {
        payload = (rows as any[]).map((r) => ({
          deviceId: r.device_id,
          farmId: undefined,
          houseId: undefined,
          sensorType: r.metric,
          value: Number(r.value),
          unit: (r.payload && (r.payload.unit || r.payload.UOM)) || r.metric,
          location: r.payload && r.payload.location ? r.payload.location : undefined,
          metadata: r.payload || undefined,
          timestamp: new Date(r.time).toISOString(),
        }));
      } else if (p.endpoint === '/sweep-readings') {
        payload = (rows as any[]).map((r) => ({
          deviceId: r.robot_id,
          farmId: undefined,
          sweepId: String(r.run_id),
          data: {
            sensorId: r.sensor_id,
            metric: r.metric,
            value: r.value,
            x: r.x,
            y: r.y,
            zoneId: r.zone_id,
            quality: r.quality,
          },
          metadata: r.payload || undefined,
          timestamp: new Date(r.time).toISOString(),
        }));
      } else if (p.endpoint === '/lab-readings') {
        payload = (rows as any[]).map((r) => ({
          sampleId: r.station_id,
          farmId: undefined,
          testType: r.metric,
          value: Number(r.value),
          unit: (r.payload && (r.payload.unit || r.payload.UOM)) || r.metric,
          result: r.payload?.result,
          metadata: r.payload || undefined,
          timestamp: new Date(r.time).toISOString(),
        }));
      } else if (p.endpoint === '/device-health') {
        payload = (rows as any[]).map((r) => ({
          deviceId: r.device_id,
          status: r.online === true ? 'ONLINE' : r.online === false ? 'OFFLINE' : 'MAINTENANCE',
          lastSeen: new Date(r.time).toISOString(),
          batteryLevel: r.meta?.batteryLevel,
          signalStrength: r.rssi,
          temperature: r.meta?.temperature,
          errors: Array.isArray(r.meta?.errors) ? r.meta.errors : [],
          warnings: Array.isArray(r.meta?.warnings) ? r.meta.warnings : [],
        }));
      }

      // Send batch to the cloud service with retry & backoff
      const url = `${p.endpoint}/batch`;
      let attempt = 0;
      let lastError: any = null;
      for (; attempt <= SYNC_MAX_RETRIES; attempt++) {
        try {
          const res = await apiClient.post(url, payload);
          const inserted = res.data?.inserted ?? res.data?.upserted ?? payload.length;
          total += inserted;
          console.log(`➡️  POST ${url} inserted=${inserted} batch=${payload.length} attempt=${attempt+1}`);
          break;
        } catch (e: any) {
          lastError = e;
          const wait = SYNC_BACKOFF_MS * Math.pow(2, attempt);
          console.warn(`⚠️  POST ${url} failed attempt=${attempt+1}/${SYNC_MAX_RETRIES+1} waiting=${wait}ms:`, e?.message || e);
          await new Promise(r => setTimeout(r, wait));
        }
      }
      if (attempt > SYNC_MAX_RETRIES) {
        throw lastError || new Error(`Failed to POST ${url}`);
      }
    } catch (error) {
      console.error(`❌ [${p.name}] failed to post data after retries:`, error);
      break;
    }

    // Update cursor based on last row
    const last = (rows as any[])[rows.length - 1][p.timeCol] as Date;
    cursor = last;
  }
}

export async function runSync() {
  if (isSyncing) return;
  isSyncing = true;
  try {
    if (!edgeDataSource.isInitialized) await edgeDataSource.initialize();
    
    const summary: { name: string; start: Date; end?: Date }[] = [];
    for (const plan of plans.sort((a, b) => a.order - b.order)) {
      const start = new Date();
      console.log(`🚚 [${plan.name}] syncing → endpoint ${plan.endpoint}`);
      await syncOne(plan);
      const end = new Date();
      summary.push({ name: plan.name, start, end });
    }
    // print summary line
    console.log("📊 sync summary:");
    summary.forEach(s => console.log(` - ${s.name} took ${(s.end!.getTime()-s.start.getTime())} ms`));
  } catch (err) {
    console.error("❌ Sync error:", err);
  } finally {
    isSyncing = false;
  }
}

