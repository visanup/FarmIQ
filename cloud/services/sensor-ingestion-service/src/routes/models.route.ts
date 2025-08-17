// src/routes/models.route.ts
import { Router } from 'express';
import { apiKey } from '../middleware/apiKey';
import { registerAndDeployModel } from '../services/model-intake.service';
import { ModelRegisterRequestSchema } from '../schemas/orchestrator.schemas';

const r = Router();

r.post('/register', apiKey, async (req, res, next) => {
  try {
    const parsed = ModelRegisterRequestSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const out = await registerAndDeployModel(parsed.data);
    res.json(out);
  } catch (e) { next(e); }
});

export default r;

