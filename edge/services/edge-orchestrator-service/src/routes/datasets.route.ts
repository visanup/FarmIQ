// src/routes/datasets.route.ts
import { Router } from 'express';
import { apiKey } from '../middleware/apiKey';
import { buildAndUploadDataset, listRecentDatasets } from '../services/dataset.service';

const r = Router();
r.post('/build', apiKey, async (req, res, next) => {
  try {
    const limit = Number(req.body?.limit ?? 5000);
    const out = await buildAndUploadDataset(limit);
    res.json(out);
  } catch (e) { next(e); }
});

r.get('/recent', apiKey, async (_req, res, next) => {
  try {
    const items = await listRecentDatasets();
    res.json(items);
  } catch (e) { next(e); }
});

export default r;
