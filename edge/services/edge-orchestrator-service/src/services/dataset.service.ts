// src/services/dataset.service.ts
import { prisma } from '../utils/prisma';
import { minio } from '../utils/minio';
import { MINIO_BUCKETS } from '../configs/config';
import { Readable } from 'stream';
import { publish } from '../utils/mqtt';

export async function buildAndUploadDataset(limit = 5000) {
  const maps = await (prisma.$queryRawUnsafe(
    `SELECT * FROM sensors.weight_mappings ORDER BY created_at DESC LIMIT $1`,
    limit
  ) as Promise<any[]>);

  const lines: string[] = ['object_key,weight'];
  for (const r of maps) {
    const mediaRows = await (prisma.$queryRawUnsafe(
      `SELECT object_key FROM sensors.media_objects WHERE media_id=$1`,
      r.media_id
    ) as Promise<any[]>);
    if (!mediaRows[0]) continue;
    lines.push(`${mediaRows[0].object_key},${r.weight_kg}`);
  }
  const csv = lines.join('\n');

  const object = `datasets/${new Date().toISOString().slice(0, 10)}/manifest-${Date.now()}.csv`;
  await minio.putObject(MINIO_BUCKETS.datasets, object, Readable.from([csv]));
  const s3 = `s3://${MINIO_BUCKETS.datasets}/${object}`;

  const rowsInserted = lines.length - 1;
  const saved = await (prisma.$queryRawUnsafe(
    `INSERT INTO sensors.dataset_exports(dataset_s3, rows, meta_json)
     VALUES ($1,$2,$3) RETURNING *`,
    s3, rowsInserted, { schema: 'v1', columns: ['object_key','weight'] }
  ) as Promise<any[]>);

  const savedRow = saved[0];
  publish('edge/datasets/ready', { dataset_s3: s3, rows: savedRow.rows, schema: 'v1' });
  return { dataset_s3: s3, rows: savedRow.rows };
}

export async function listRecentDatasets(limit = 10) {
  return prisma.$queryRawUnsafe(
    `SELECT * FROM sensors.dataset_exports ORDER BY created_at DESC LIMIT $1`,
    limit
  ) as Promise<any[]>;
}

// Create sweep reading for robot operations
export async function createSweepReading(data: {
  tenantId: string;
  robotId: string;
  farmId?: string;
  houseId?: string;
  sweepId: string;
  time: Date;
  data: {
    zones: number;
    animalsDetected: number;
    averageWeight: number;
    temperature: number;
    humidity: number;
    co2: number;
    sweepDuration: number;
    success: boolean;
    sensorId?: string;
    metric?: string;
    value?: number;
    x?: number;
    y?: number;
    zoneId?: string;
    quality?: string;
  };
  metadata?: any;
}) {
  const sweepReading = {
    deviceId: data.robotId,
    farmId: data.farmId || data.tenantId,
    sweepId: data.sweepId,
    data: data.data,
    metadata: {
      ...(data.metadata || {}),
      tenantId: data.tenantId,
      farmId: data.farmId,
      houseId: data.houseId,
      robotId: data.robotId,
      sweepId: data.sweepId,
      generatedAt: new Date().toISOString()
    },
    timestamp: data.time
  };

  // Insert into sweep_readings table for sync service
  await prisma.$executeRawUnsafe(
    `INSERT INTO sensors.sweep_readings 
     (device_id, farm_id, sweep_id, data, metadata, time)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (device_id, sweep_id, time) 
     DO UPDATE SET data=EXCLUDED.data, metadata=EXCLUDED.metadata`,
    sweepReading.deviceId,
    sweepReading.farmId,
    sweepReading.sweepId,
    JSON.stringify(sweepReading.data),
    JSON.stringify(sweepReading.metadata),
    sweepReading.timestamp
  );

  return sweepReading;
}