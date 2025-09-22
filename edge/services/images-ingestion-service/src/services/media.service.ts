// src/services/media.service.ts
// src/services/media.service.ts
import crypto from 'crypto';
import path from 'path';
import sharp from 'sharp';
import { prisma } from '../utils/prisma';
import { minio, MINIO_BUCKETS } from '../utils/minio';
import { publishIngest } from '../utils/mqtt';

type IngestMeta = {
  tenant_id: string;
  farm_id?: string;
  house_id?: string;
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

  let mediaId: string = '';
  await prisma.$transaction(async (tx: any) => {
    const id = crypto.randomUUID();
    mediaId = crypto.randomUUID();
    
    const rows = await (tx.$queryRawUnsafe(
      `INSERT INTO edge_image.media_objects (id, "mediaId", time, "tenantId", "farmId", "houseId", "stationId", "sensorId", bucket, "objectKey", "fileName", "fileSize", "mimeType", sha256, width, height, metadata, "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       RETURNING "mediaId"`,
      id, mediaId, now, meta.tenant_id, (meta as any).farm_id || null, (meta as any).house_id || null, meta.station_id || null, meta.sensor_id || null, bucket, objectKey, file.originalname, size, file.mimetype || 'application/octet-stream', sha256, width ?? null, height ?? null, { mimetype: file.mimetype, size }, now, now
    ) as Promise<any[]>);
    // mediaId is already set above

    // Skip reading_media_map for now as it has different schema
    // await tx.$executeRawUnsafe(
    //   `INSERT INTO edge_image.reading_media_map (id, "mediaId", "readingId", "deltaMs", "strategy", "confidence", "metadata", "createdAt", "updatedAt")
    //    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    //    ON CONFLICT DO NOTHING`,
    //   crypto.randomUUID(), mediaId, 'unknown', 0, 'manual', null, {}, now, now
    // );
  });

    // แจ้ง event เข้า MQTT (non-blocking)
    try {
      publishIngest({
        kind: 'image',
        bucket,               // ✅ ใช้ bucket จริง
        objectKey,
        media_id: mediaId,
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

    return { ok: true, media_id: mediaId, object_key: objectKey, bucket };
  
}

export async function listRecentMedia(limit = 20) {
  const lim = Math.min(Math.max(limit, 1), 200);
  return prisma.$queryRawUnsafe(
    `SELECT * FROM edge_image.media_objects ORDER BY time DESC LIMIT $1`,
    lim
  ) as Promise<any[]>;
}


