// services/sensor-service/src/utils/data-source.ts

import "reflect-metadata";
import { DataSource } from "typeorm";
import { SensorData } from "../models/sensorDataModel";
import {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} from "../configs/config";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: false,
  logging: false,
  schema: "sensors",
  entities: [SensorData],
});


