// /src/routes/associations.route.ts

import { Router, Request, Response, NextFunction } from 'express';
import { apiKey } from '../middleware/apiKey';
import { listRecentAssociations, getAssociationByMediaId } from '../services/readingMediaMap.service';
import { AppDataSource } from '../utils/dataSource';
import { ReadingMediaMap } from '../models/ReadingMediaMap';
import { Reading } from '../models/Reading';
import { MediaObject } from '../models/MediaObject';

const r = Router();

/**
 * GET /associations/recent?limit=20&include=brief|full
 * - include=brief (default): คืนเฉพาะแถว mapping
 * - include=full: join ข้อมูล Reading และ MediaObject ให้ด้วย
 */
r.get('/associations/recent', apiKey, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limitRaw = Number.parseInt(String(req.query.limit ?? '20'), 10);
    const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 20, 1), 200);
    const include = String(req.query.include ?? 'brief'); // 'brief' | 'full'

    if (include === 'full') {
      const repo = AppDataSource.getRepository(ReadingMediaMap);
      const rows = await repo
        .createQueryBuilder('m')
        .leftJoinAndMapOne('m.reading', Reading, 'r', 'r.id = m.reading_id')
        .leftJoinAndMapOne('m.media', MediaObject, 'mo', 'mo.media_id = m.media_id')
        .orderBy('m.created_at', 'DESC')
        .limit(limit)
        .getMany();
      return res.json(rows);
    }

    const rows = await listRecentAssociations(limit);
    return res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /associations/by-media/:mediaId?include=brief|full
 * - ดึง mapping ล่าสุดของ media ที่ระบุ
 */
r.get('/associations/by-media/:mediaId', apiKey, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mediaId = req.params.mediaId;
    const include = String(req.query.include ?? 'brief');

    if (include === 'full') {
      const repo = AppDataSource.getRepository(ReadingMediaMap);
      const row = await repo
        .createQueryBuilder('m')
        .leftJoinAndMapOne('m.reading', Reading, 'r', 'r.id = m.reading_id')
        .leftJoinAndMapOne('m.media', MediaObject, 'mo', 'mo.media_id = m.media_id')
        .where('m.media_id = :mid', { mid: String(mediaId) })
        .orderBy('m.created_at', 'DESC')
        .getOne();

      if (!row) return res.status(404).json({ error: 'Not found' });
      return res.json(row);
    }

    const row = await getAssociationByMediaId(mediaId);
    if (!row) return res.status(404).json({ error: 'Not found' });
    return res.json(row);
  } catch (err) {
    next(err);
  }
});

export default r;
