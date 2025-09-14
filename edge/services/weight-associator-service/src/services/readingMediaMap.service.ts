// src/services/readingMediaMap.service.ts

import { prisma } from '../utils/prisma';

export async function createAssociation(
  mediaId: string | number,
  readingId: string | number,
  deltaMs: number,
  method: 'nearest' | 'window' | 'exact' = 'nearest',
  confidence?: number | null
) {
  await prisma.$executeRawUnsafe(
    `INSERT INTO sensors.reading_media_map(media_id, reading_id, delta_ms, method, confidence)
     VALUES ($1,$2,$3,$4,$5)`,
    String(mediaId), String(readingId), deltaMs, method, confidence ?? null
  );
  return { media_id: String(mediaId), reading_id: String(readingId), delta_ms: deltaMs, method, confidence: confidence ?? null } as any;
}

export async function getAssociationByMediaId(mediaId: string | number) {
  const rows = await (prisma.$queryRawUnsafe(
    `SELECT * FROM sensors.reading_media_map WHERE media_id=$1 ORDER BY created_at DESC LIMIT 1`,
    String(mediaId)
  ) as Promise<any[]>);
  return rows[0] ?? null;
}

export async function listRecentAssociations(limit = 20) {
  const lim = Math.min(Math.max(limit, 1), 200);
  return prisma.$queryRawUnsafe(
    `SELECT * FROM sensors.reading_media_map ORDER BY created_at DESC LIMIT $1`,
    lim
  ) as Promise<any[]>;
}

