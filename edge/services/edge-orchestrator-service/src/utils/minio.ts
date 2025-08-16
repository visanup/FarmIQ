// src/utils/minio.ts

import { Client } from 'minio';
import { MINIO_ACCESS_KEY, MINIO_ENDPOINT, MINIO_SECRET_KEY, MINIO_BUCKETS } from '../configs/config';

const url = new URL(MINIO_ENDPOINT);

export const minio = new Client({
  endPoint: url.hostname,
  port: Number(url.port || (url.protocol === 'https:' ? 443 : 80)),
  useSSL: url.protocol === 'https:',
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});

export async function ensureBucket(bucket: string) {
  const exists = await minio.bucketExists(bucket).catch(() => false);
  if (!exists) {
    await minio.makeBucket(bucket, 'us-east-1');
    console.log(`🪣 created bucket: ${bucket}`);
  } else {
    console.log(`ℹ️ bucket exists: ${bucket}`);
  }
}

export async function ensureBuckets() {
  await ensureBucket(MINIO_BUCKETS.raw);
  await ensureBucket(MINIO_BUCKETS.datasets);
  await ensureBucket(MINIO_BUCKETS.models);
}


