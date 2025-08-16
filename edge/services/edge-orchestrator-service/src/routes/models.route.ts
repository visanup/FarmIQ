// src/routes/models.route.ts
import { Router } from 'express';
import { apiKey } from '../middleware/apiKey';
import { registerAndDeployModel } from '../services/model-intake.service';

const r = Router();

r.post('/register', apiKey, async (req, res, next) => {
  try {
    const { model_name, version, artifact_s3, metrics, auto_deploy } = req.body ?? {};
    if (!model_name || !version || !artifact_s3) {
      return res.status(400).json({ error: 'model_name, version, artifact_s3 are required' });
    }
    const out = await registerAndDeployModel({ model_name, version, artifact_s3, metrics, auto_deploy });
    res.json(out);
  } catch (e) { next(e); }
});

export default r;
