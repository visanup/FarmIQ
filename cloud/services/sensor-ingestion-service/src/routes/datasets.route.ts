// src/routes/datasets.route.ts
import { Router } from 'express';
import { apiKey } from '../middleware/apiKey';
import { buildAndUploadDataset, listRecentDatasets } from '../services/dataset.service';
import { BuildDatasetRequestSchema } from '../schemas/orchestrator.schemas';

const r = Router();

r.post('/build', apiKey, async (req, res, next) => {
  try {
    // ✅ validate + default ด้วย Zod
    const parsed = BuildDatasetRequestSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const { limit /*, split*/ } = parsed.data;
    const out = await buildAndUploadDataset(limit); // ถ้าจะรองรับ split ค่อยส่งต่อเข้า service ทีหลัง
    res.json(out);
  } catch (e) { next(e); }
});

r.get('/recent', apiKey, async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query?.limit ?? 10), 1), 100);
    const items = await listRecentDatasets(limit);
    res.json(items);
  } catch (e) { next(e); }
});

export default r;

