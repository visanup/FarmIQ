// src/services/sensor.service.ts

import { AppDataSource } from "../utils/dataSource";
import { SensorReading } from "../models/SensorReading";

export async function saveReading(r: {
  time: Date; tenant: string; deviceId: string; metric: string; value: number; rawPayload?: any;
}) {
  const repo = AppDataSource.getRepository(SensorReading);
  return repo.save(repo.create(r));
}
