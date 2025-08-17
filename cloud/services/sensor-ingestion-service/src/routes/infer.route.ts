// src/routes/infer.route.ts
import { Router } from 'express';
import { apiKey } from '../middleware/apiKey';
import { backfillInfer } from '../services/infer.service';
import { BackfillRequestSchema } from '../schemas/orchestrator.schemas';

const r = Router();

r.post('/backfill', apiKey, async (req, res, next) => {
  try {
    const parsed = BackfillRequestSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const out = await backfillInfer(parsed.data.object_keys);
    res.json(out);
  } catch (e) { next(e); }
});

export default r;

