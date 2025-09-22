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
      | "edge_sensor.sweep_readings"
      | "edge_sensor.lab_readings"
      | "edge_sensor.device_readings"
      | "edge_sensor.device_health";
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

// Helper functions for data mapping
function getUnitForSensorType(sensorType: string): string {
  const unitMap: { [key: string]: string } = {
    'temperature': '°C',
    'humidity': '%',
    'CO2': 'ppm',
    'NH3': 'ppm',
    'illuminance': 'lux',
    'photoperiod': 'hours',
    'VOCs': 'ppb',
    'pH': 'pH',
    'TDS': 'ppm',
    'EC': 'mS/cm',
    'water_volume': 'L',
    'water_temp': '°C',
    'feed.intake.kg': 'kg',
    'sensors.weight_scale.current_kg': 'kg',
    'sensors.weight_predict.current_kg': 'kg'
  };
  return unitMap[sensorType] || sensorType;
}

function getUnitForTestType(testType: string): string {
  const unitMap: { [key: string]: string } = {
    'water_quality': 'score',
    'feed_analysis': 'mg/kg',
    'soil_analysis': 'pH',
    'pathogen_test': 'cfu/ml',
    'nutrient_analysis': 'ppm'
  };
  return unitMap[testType] || 'unit';
}

function getResultForValue(testType: string, value: number): string {
  // Simple pass/fail logic based on test type and value
  switch (testType) {
    case 'water_quality':
      return value >= 70 ? 'PASS' : 'FAIL';
    case 'pathogen_test':
      return value <= 100 ? 'PASS' : 'FAIL';
    case 'soil_analysis':
      return value >= 6.0 && value <= 8.0 ? 'PASS' : 'FAIL';
    default:
      return value > 0 ? 'PASS' : 'FAIL';
  }
}

  const plans: Plan[] = [
    {
      name: "edge_sensor.sweep_readings",
    entity: SweepReading,
    timeCol: "timestamp",
    endpoint: "/sweep-readings",
    filter: TENANT ? "t.tenantId = :tenant" : undefined,
    batch: BATCH_SWEEP,
    order: 2,
  },
    {
      name: "edge_sensor.lab_readings",
    entity: LabReading,
    timeCol: "timestamp",
    endpoint: "/lab-readings",
    filter: TENANT ? "t.tenantId = :tenant" : undefined,
    batch: BATCH_LAB,
    order: 2,
  },
    {
      name: "edge_sensor.device_readings",
    entity: DeviceReading,
    timeCol: "timestamp",
    endpoint: "/sensor-readings",
    filter: TENANT ? "t.tenantId = :tenant" : undefined,
    batch: BATCH_DEVICE,
    order: 2,
  },
    {
      name: "edge_sensor.device_health",
    entity: DeviceHealth,
    timeCol: "lastSeen",
    endpoint: "/device-health",
    filter: TENANT ? "t.tenantId = :tenant" : undefined,
    batch: BATCH_HEALTH,
    order: 3,
  },
];

async function getCursor(endpoint: string): Promise<Date> {
  try {
    let url = `${endpoint}/latest-timestamp`;

    if (endpoint === '/device-health') {
      url = `${endpoint}/latest-timestamp/all`;
    }

    const response = await apiClient.get<Record<string, string | undefined>>(url);
    const raw = response.data;
    const candidate = raw?.last_ts ?? raw?.lastTimestamp ?? raw?.lastSyncedAt ?? raw?.timestamp;

    if (!candidate) {
      console.warn(`No cursor from ${endpoint}, defaulting to epoch`);
      return new Date(0);
    }

    const lastTs = new Date(candidate);
    if (isNaN(lastTs.getTime())) {
      console.warn(`Invalid timestamp from ${endpoint}: ${candidate}`);
      return new Date(0);
    }

    return new Date(lastTs.getTime() - 1);
  } catch (error: any) {
    if (error?.response?.status === 404) {
      console.warn(`Cursor endpoint ${endpoint} not found (404); treating as empty dataset`);
      return new Date(0);
    }

    console.error(`Error fetching cursor for ${endpoint}:`, error);
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
         payload = (rows as DeviceReading[]).map((r) => {
           const raw = (r.payload ?? {}) as Record<string, any>;
           const farmId = raw.farmId ?? raw.metadata?.farmId ?? null;
           const houseId = raw.houseId ?? raw.metadata?.houseId ?? null;
           const stationId = raw.stationId ?? raw.metadata?.stationId ?? null;

           return {
             deviceId: r.deviceId,
             tenantId: r.tenantId,
             farmId: farmId || r.tenantId,
             houseId: houseId || stationId || null,
             sensorType: r.metric,
             value: Number(r.value),
             unit: raw.unit ?? raw.UOM ?? getUnitForSensorType(r.metric),
             location: raw.location,
             metadata: {
               ...raw,
               tenantId: r.tenantId,
               robotId: r.robotId,
               farmId,
               houseId,
               stationId,
               quality: r.quality,
               generatedAt: new Date().toISOString(),
             },
             timestamp: r.timestamp.toISOString(),
           };
         });
      } else if (p.endpoint === '/sweep-readings') {
         payload = (rows as SweepReading[]).map((r) => {
           const data = r.data ?? {};
           const metadata = r.metadata ?? {};
           return {
             deviceId: r.deviceId,
             farmId: r.farmId ?? r.tenantId,
             sweepId: r.sweepId,
             data: {
               zones: data.zones ?? 1,
               animalsDetected: data.animalsDetected ?? 0,
               averageWeight: data.averageWeight ?? 0,
               temperature: data.temperature ?? 25,
               humidity: data.humidity ?? 60,
               co2: data.co2 ?? 400,
               sweepDuration: data.sweepDuration ?? 60,
               success: data.success !== false,
               ...data,
             },
             metadata: {
               ...metadata,
               tenantId: r.tenantId,
               deviceId: r.deviceId,
               sweepId: r.sweepId,
               generatedAt: new Date().toISOString(),
             },
             timestamp: r.timestamp.toISOString(),
           };
         });
      } else if (p.endpoint === '/lab-readings') {
         payload = (rows as LabReading[]).map((r) => {
           const raw = (r.payload ?? {}) as Record<string, any>;
           return {
             sampleId: r.sampleId,
             tenantId: r.tenantId,
             robotId: r.robotId,
             runId: r.runId,
             testType: r.metric,
             value: Number(r.value),
             unit: raw.unit ?? raw.UOM ?? getUnitForTestType(r.metric),
             result: raw.result ?? getResultForValue(r.metric, r.value),
             metadata: {
               ...raw,
               tenantId: r.tenantId,
               robotId: r.robotId,
               runId: r.runId,
               sampleId: r.sampleId,
               generatedAt: new Date().toISOString(),
             },
             timestamp: r.timestamp.toISOString(),
           };
         });
      } else if (p.endpoint === '/device-health') {
        payload = (rows as DeviceHealth[]).map((r) => {
          const metadata = r.metadata ?? {};
          return {
            deviceId: r.deviceId,
            tenantId: r.tenantId,
            status: r.status,
            lastSeen: r.lastSeen.toISOString(),
            batteryLevel: r.batteryLevel ?? 100,
            signalStrength: r.signalStrength ?? -50,
            temperature: r.temperature ?? 25,
            errors: r.errors ?? [],
            warnings: r.warnings ?? [],
          };
        });
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
    const last = (rows as any[])[rows.length - 1][p.timeCol];
    if (last instanceof Date) {
      cursor = last;
    } else if (typeof last === 'string') {
      const parsedDate = new Date(last);
      if (isNaN(parsedDate.getTime())) {
        console.warn(`Invalid timestamp in row: ${last}`);
        cursor = new Date(0);
      } else {
        cursor = parsedDate;
      }
    } else {
      console.warn(`Unexpected timestamp type: ${typeof last}`);
      cursor = new Date(0);
    }
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
