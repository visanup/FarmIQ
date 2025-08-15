// services/sync-service/src/utils/syncJob.ts

import { edgeDataSource, cloudDataSource } from "./dataSource";
import { SensorData } from "../models/sensorDataModel";

let isSyncing = false;
export async function runSync() {
  if (isSyncing) return;
  isSyncing = true;
  try {
    // Ensure connections
    if (!edgeDataSource.isInitialized) await edgeDataSource.initialize();
    if (!cloudDataSource.isInitialized) await cloudDataSource.initialize();

    // 1) Find latest timestamp in cloud
    const result = await cloudDataSource
      .createQueryBuilder(SensorData, "s")
      .select("MAX(s.time)", "max")
      .getRawOne<{ max: Date }>();
    const lastTime = result?.max ?? new Date(0);
    console.log(`🔍 Last synced time: ${lastTime.toISOString()}`);

    // 2) Back off by 1ms to ensure no rows are missed
    const fetchTime = new Date(lastTime.getTime() - 1);
    console.log(`🔍 Fetching records with time > ${fetchTime.toISOString()}`);

    // 3) Fetch new records from edge
    const newRows: SensorData[] = await edgeDataSource
      .getRepository(SensorData)
      .createQueryBuilder("s")
      .where("s.time > :fetchTime", { fetchTime })
      .orderBy("s.time", "ASC")
      .getMany();

    console.log(`🔍 Fetched ${newRows.length} new rows`);

    // 4) Insert into cloud if any
    if (newRows.length) {
      await cloudDataSource.getRepository(SensorData).save(newRows, { chunk: 100 });
      console.log(`✅ Synced ${newRows.length} rows (>${fetchTime.toISOString()})`);
    } else {
      console.log("ℹ️ No new rows to sync");
    }
  } catch (err) {
    console.error("❌ Sync error:", err);
  } finally {
    isSyncing = false;
  }
}
