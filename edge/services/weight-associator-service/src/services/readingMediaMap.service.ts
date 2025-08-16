// src/services/readingMediaMap.service.ts

import { AppDataSource } from '../utils/dataSource';
import { ReadingMediaMap } from '../models/ReadingMediaMap';

export async function createAssociation(
  mediaId: string | number,
  readingId: string | number,
  deltaMs: number,
  method: 'nearest' | 'window' | 'exact' = 'nearest',
  confidence?: number | null
) {
  const repo = AppDataSource.getRepository(ReadingMediaMap);
  const row = repo.create({
    media_id: String(mediaId),
    reading_id: String(readingId),
    delta_ms: deltaMs,
    method,
    confidence: confidence ?? null,
  });
  return repo.save(row);
}

export async function getAssociationByMediaId(mediaId: string | number) {
  return AppDataSource.getRepository(ReadingMediaMap)
    .createQueryBuilder('map')
    .where('map.media_id = :mid', { mid: String(mediaId) })
    .orderBy('map.created_at', 'DESC')
    .getOne();
}

export async function listRecentAssociations(limit = 20) {
  return AppDataSource.getRepository(ReadingMediaMap)
    .createQueryBuilder('map')
    .orderBy('map.created_at', 'DESC')
    .limit(Math.min(Math.max(limit, 1), 200))
    .getMany();
}

