// src/utils/dataSource.ts

import "reflect-metadata";
import { DataSource } from "typeorm";
import { SensorReading } from "../models/SensorReading";
import { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } from "../configs/config";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  schema: "sensors",
  synchronize: false,
  logging: false,
  entities: [SensorReading],
});