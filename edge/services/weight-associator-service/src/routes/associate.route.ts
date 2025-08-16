// src/routes/associate.route.ts

import { Router } from 'express';
import { apiKey } from '../middleware/apiKey';
import { listRecentAssociations, getAssociationByMediaId } from '../services/readingMediaMap.service';

const r = Router();

r.get('/associations/recent', apiKey, async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 200);
    const rows = await listRecentAssociations(limit);
    res.json(rows);
  } catch (e) { next(e); }
});

r.get('/associations/by-media/:mediaId', apiKey, async (req, res, next) => {
  try {
    const row = await getAssociationByMediaId(req.params.mediaId);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (e) { next(e); }
});

export default r;

