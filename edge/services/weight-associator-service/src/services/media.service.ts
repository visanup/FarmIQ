// src/services/media.service.ts

import { prisma } from '../utils/prisma';

/**
 * ตัวชี้สื่อ (ไม่ผูกกับสคีม่า AssociateRequest เพื่อหลบปัญหา window_ms)
 */
export type MediaRef = {
  media_id?: number | string;
  bucket?: string;
  object_key?: string;
};

async function findOne(sql: string, ...args: any[]) {
  const rows = await (prisma.$queryRawUnsafe(sql, ...args) as Promise<any[]>);
  if (!rows[0]) throw new Error('Media not found');
  return rows[0];
}

/**
 * ดึง MediaObject ตาม media_id (string/bigint)
 */
export async function getMediaById(mediaId: number | string): Promise<any> {
  return findOne(`SELECT * FROM sensors.media_objects WHERE media_id=$1`, String(mediaId));
}

/**
 * ดึง MediaObject ตาม (bucket, object_key)
 */
export async function getMediaByBucketKey(bucket: string, object_key: string): Promise<any> {
  return findOne(`SELECT * FROM sensors.media_objects WHERE bucket=$1 AND object_key=$2`, bucket, object_key);
}

/**
 * รับอ้างอิงสื่อแบบยืดหยุ่น:
 * - ถ้ามี media_id → ใช้ดึงโดยตรง
 * - ถ้ามี bucket + object_key → ใช้คีย์ไฟล์
 */
export async function resolveMedia(ref: MediaRef): Promise<any> {
  if (ref.media_id != null) {
    return getMediaById(ref.media_id);
  }
  if (ref.bucket && ref.object_key) {
    return getMediaByBucketKey(ref.bucket, ref.object_key);
  }
  throw new Error('media reference required (media_id หรือ bucket+object_key)');
}

/**
 * รายการสื่อล่าสุดสำหรับ debug/ตรวจสอบเร็ว
 */
export async function listRecentMedia(limit = 20): Promise<any[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 200);
  return prisma.$queryRawUnsafe(
    `SELECT * FROM sensors.media_objects ORDER BY time DESC LIMIT $1`,
    safeLimit
  ) as Promise<any[]>;
}



