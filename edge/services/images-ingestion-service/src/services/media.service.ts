// src/services/media.service.ts
// src/services/media.service.ts
import crypto from 'crypto';
import path from 'path';
import sharp from 'sharp';
import { AppDataSource } from '../utils/dataSource';
import { MediaObject } from '../models/MediaObject';
import { ReadingMediaMap } from '../models/ReadingMediaMap';
import { minio, MINIO_BUCKETS } from '../utils/minio';
import { publishIngest } from '../utils/mqtt';

type IngestMeta = {
  tenant_id: string;
  metric?: string;
  time?: string;
  robot_id?: string;
  run_id?: string;
  station_id?: string;
  sensor_id?: string;
  kind?: string;
};

export async function ingestImage(
  file: { buffer: Buffer; originalname: string; mimetype?: string; size?: number },
  meta: IngestMeta
) {
  const now = meta.time ? new Date(meta.time) : new Date();
  const sha256 = crypto.createHash('sha256').update(file.buffer).digest('hex');

  let width: number | null = null, height: number | null = null;
  try {
    const info = await sharp(file.buffer).metadata();
    width = info.width ?? null;
    height = info.height ?? null;
  } catch {
    // ignore EXIF/metadata errors
  }

  // ✅ buckets ถูก ensure แล้วตอน start() ใน server.ts (ensureBuckets())

  const ext = path.extname(file.originalname) || '.jpg';
  const objectKey = `${meta.tenant_id}/${meta.sensor_id || 'unknown'}/${now.getTime()}-${sha256.slice(0, 10)}${ext}`;
  const bucket = MINIO_BUCKETS.raw; // 📌 ใช้ bucket ภาพดิบ

  const size = typeof file.size === 'number' ? file.size : file.buffer.length;

  await minio.putObject(
    bucket,
    objectKey,
    file.buffer,
    size,
    { 'Content-Type': file.mimetype || 'application/octet-stream' }
  );

  const qr = AppDataSource.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();
  try {
    const mediaRepo = qr.manager.getRepository(MediaObject);
    const mapRepo = qr.manager.getRepository(ReadingMediaMap);

    const media = mediaRepo.create({
      time: now,
      tenant_id: meta.tenant_id,
      kind: meta.kind || 'image',
      bucket,                 // ✅ บันทึกชื่อ bucket ที่ใช้จริง
      object_key: objectKey,
      sha256,
      width: width ?? undefined,
      height: height ?? undefined,
      meta: { mimetype: file.mimetype, size },
    });
    const saved = await mediaRepo.save(media);

    const link = mapRepo.create({
      time: now,
      tenant_id: meta.tenant_id,
      robot_id: meta.robot_id ?? null,
      run_id: meta.run_id ?? null,
      station_id: meta.station_id ?? null,
      sensor_id: meta.sensor_id ?? null,
      metric: meta.metric || 'image',
      media_id: saved.media_id,
    });
    await mapRepo.save(link);

    await qr.commitTransaction();

    // แจ้ง event เข้า MQTT (non-blocking)
    try {
      publishIngest({
        kind: 'image',
        bucket,               // ✅ ใช้ bucket จริง
        objectKey,
        media_id: saved.media_id,
        time: now.toISOString(),
        tenant_id: meta.tenant_id,
        robot_id: meta.robot_id,
        station_id: meta.station_id,
        sensor_id: meta.sensor_id,
        metric: meta.metric || 'image',
        sha256,
        width,
        height,
      });
    } catch (e) {
      console.error('MQTT publish failed:', e);
    }

    return { ok: true, media_id: saved.media_id, object_key: objectKey, bucket };
  } catch (e) {
    await qr.rollbackTransaction();
    throw e;
  } finally {
    await qr.release();
  }
}

export async function listRecentMedia(limit = 20) {
  return AppDataSource.getRepository(MediaObject)
    .createQueryBuilder('m')
    .orderBy('m.time', 'DESC')
    .limit(limit)
    .getMany();
}


