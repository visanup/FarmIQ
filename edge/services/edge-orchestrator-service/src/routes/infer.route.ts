// src/routes/infer.route.ts
import { Router } from 'express';
import { apiKey } from '../middleware/apiKey';
import { backfillInfer } from '../services/infer.service';

const r = Router();

r.post('/backfill', apiKey, async (req, res, next) => {
  try {
    const keys: string[] = req.body?.object_keys ?? [];
    if (!Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({ error: 'object_keys[] required' });
    }
    const out = await backfillInfer(keys);
    res.json(out);
  } catch (e) { next(e); }
});

export default r;
