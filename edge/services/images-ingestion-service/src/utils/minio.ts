// src/utils/minio.ts

import { Client } from 'minio';
import {
  MINIO_ACCESS_KEY,
  MINIO_ENDPOINT,
  MINIO_SECRET_KEY,
  MINIO_BUCKETS,          // ✅ ใช้ตัวรวม
} from '../configs/config';

const url = new URL(MINIO_ENDPOINT);

export const minio = new Client({
  endPoint: url.hostname,
  port: Number(url.port || (url.protocol === 'https:' ? 443 : 80)),
  useSSL: url.protocol === 'https:',
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});

/** สร้างบัคเก็ตเดี่ยว ๆ แบบ idempotent */
export async function ensureBucket(bucket: string) {
  try {
    const exists = await minio.bucketExists(bucket).catch(() => false);
    if (!exists) {
      // สำหรับ MinIO จะใส่ 'us-east-1' หรือ '' ก็ได้
      await minio.makeBucket(bucket, 'us-east-1');
      console.log(`🪣 created bucket: ${bucket}`);
    } else {
      console.log(`ℹ️ bucket exists: ${bucket}`);
    }
  } catch (err: any) {
    console.error(`❌ ensureBucket(${bucket}) failed:`, err?.message || err);
    throw err;
  }
}

/** สร้างทั้งสามบัคเก็ตที่ระบบต้องใช้ (เรียกจาก service เดียวเท่านั้น) */
export async function ensureBuckets() {
  await ensureBucket(MINIO_BUCKETS.raw);
  await ensureBucket(MINIO_BUCKETS.datasets);
  await ensureBucket(MINIO_BUCKETS.models);
}

export { MINIO_BUCKETS };

