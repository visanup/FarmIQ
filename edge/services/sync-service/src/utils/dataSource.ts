// src/utils/dataSource.ts
import { DataSource } from "typeorm";
import { SensorData } from "../models/sensorDataModel";
import { EDGE_DATABASE_URL, CLOUD_DATABASE_URL } from "../configs/config";

export const edgeDataSource = new DataSource({
  type: "postgres",
  url: EDGE_DATABASE_URL,
  entities: [SensorData],
  migrations: [],
  synchronize: false,
  logging: false,
});

export const cloudDataSource = new DataSource({
  type: "postgres",
  url: CLOUD_DATABASE_URL,
  entities: [SensorData],
  migrations: [],
  synchronize: false,
  logging: false,
});


