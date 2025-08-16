// src/services/dataset.service.ts
import { AppDataSource } from '../utils/dataSource';
import { DatasetExport } from '../models/DatasetExport';
import { MediaObject } from '../models/MediaObject';
import { WeightMapping } from '../models/WeightMapping';
import { minio } from '../utils/minio';
import { MINIO_BUCKETS } from '../configs/config';
import { Readable } from 'stream';
import { publish } from '../utils/mqtt';

export async function buildAndUploadDataset(limit = 5000) {
  const repoMap = AppDataSource.getRepository(WeightMapping);
  const repoMedia = AppDataSource.getRepository(MediaObject);

  const maps = await repoMap.createQueryBuilder('m')
    .orderBy('m.created_at', 'DESC')
    .limit(limit)
    .getMany();

  const lines: string[] = ['object_key,weight'];
  for (const r of maps) {
    const media = await repoMedia.findOneBy({ media_id: r.media_id });
    if (!media) continue;
    lines.push(`${media.object_key},${r.weight_kg}`);
  }
  const csv = lines.join('\n');

  const object = `datasets/${new Date().toISOString().slice(0, 10)}/manifest-${Date.now()}.csv`;
  await minio.putObject(MINIO_BUCKETS.datasets, object, Readable.from([csv]));
  const s3 = `s3://${MINIO_BUCKETS.datasets}/${object}`;

  const rec = AppDataSource.getRepository(DatasetExport).create({
    dataset_s3: s3,
    rows: lines.length - 1,
    meta_json: { schema: 'v1', columns: ['object_key', 'weight'] }
  });
  await AppDataSource.getRepository(DatasetExport).save(rec);

  publish('edge/datasets/ready', { dataset_s3: s3, rows: rec.rows, schema: 'v1' });
  return { dataset_s3: s3, rows: rec.rows };
}

export async function listRecentDatasets(limit = 10) {
  return AppDataSource.getRepository(DatasetExport)
    .createQueryBuilder('d')
    .orderBy('d.created_at', 'DESC')
    .limit(limit)
    .getMany();
}
