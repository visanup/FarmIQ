// src/services/media.service.ts

import { AppDataSource } from '../utils/dataSource';
import { MediaObject } from '../models/MediaObject';

/**
 * ตัวชี้สื่อ (ไม่ผูกกับสคีม่า AssociateRequest เพื่อหลบปัญหา window_ms)
 */
export type MediaRef = {
  media_id?: number | string;
  bucket?: string;
  object_key?: string;
};

const repo = () => AppDataSource.getRepository(MediaObject);

/**
 * ดึง MediaObject ตาม media_id (string/bigint)
 */
export async function getMediaById(mediaId: number | string): Promise<MediaObject> {
  return repo().findOneByOrFail({ mediaId: String(mediaId) });
}

/**
 * ดึง MediaObject ตาม (bucket, object_key)
 */
export async function getMediaByBucketKey(bucket: string, object_key: string): Promise<MediaObject> {
  return repo().findOneByOrFail({ bucket, object_key });
}

/**
 * รับอ้างอิงสื่อแบบยืดหยุ่น:
 * - ถ้ามี media_id → ใช้ดึงโดยตรง
 * - ถ้ามี bucket + object_key → ใช้คีย์ไฟล์
 */
export async function resolveMedia(ref: MediaRef): Promise<MediaObject> {
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
export async function listRecentMedia(limit = 20): Promise<MediaObject[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 200);
  return repo()
    .createQueryBuilder('m')
    .orderBy('m.time', 'DESC')
    .limit(safeLimit)
    .getMany();
}



