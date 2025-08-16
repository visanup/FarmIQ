// src/utils/dataSource.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import {
  EDGE_DATABASE_URL,
  CLOUD_DATABASE_URL,
} from "../configs/config";

// Entities (ต้องมีไฟล์เหล่านี้อยู่แล้วตามที่เราคุยกัน)
import { SweepReading } from "../models/SweepReading";
import { LabReading } from "../models/LabReading";
import { DeviceReading } from "../models/DeviceReading";
import { DeviceHealth } from "../models/DeviceHealth";
import { SyncState } from "../models/SyncState";

export const edgeDataSource = new DataSource({
  type: "postgres",
  url: EDGE_DATABASE_URL,
  applicationName: "sync-service-edge",
  entities: [SweepReading, LabReading, DeviceReading, DeviceHealth, SyncState],
  synchronize: false, // ใช้ DDL/migrations เอง
  // schema: ไม่ต้องกำหนด เพราะเราใส่ schema ใน @Entity แต่ถ้าต้องการบังคับให้ทั้งคอนเนกชันอยู่ใน sensors: schema: "sensors"
});

export const cloudDataSource = new DataSource({
  type: "postgres",
  url: CLOUD_DATABASE_URL,
  applicationName: "sync-service-cloud",
  entities: [SweepReading, LabReading, DeviceReading, DeviceHealth, SyncState],
  synchronize: false,
});