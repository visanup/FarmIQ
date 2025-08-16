// src/utils/dataSource.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import { EDGE_DATABASE_URL, CLOUD_DATABASE_URL } from "../configs/config";
import { SweepReading } from "../models/SweepReading";
import { LabReading } from "../models/LabReading";
import { DeviceHealth } from "../models/DeviceHealth";

export const edgeDataSource = new DataSource({
  type: "postgres",
  url: EDGE_DATABASE_URL,
  entities: [SweepReading, LabReading, DeviceHealth],
  synchronize: false,
  schema: "sensors",
});

export const cloudDataSource = new DataSource({
  type: "postgres",
  url: CLOUD_DATABASE_URL,
  entities: [SweepReading, LabReading, DeviceHealth],
  synchronize: false,
  schema: "sensors",
});



