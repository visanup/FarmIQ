// src/routes/index.ts

import { Router } from 'express';
import { apiKey } from '../middleware/apiKey';
import { AppDataSource } from '../utils/dataSource';
import { StreamState } from '../models/StreamState';
import { streamPlanOnce } from '../services/streamer.service';

const router = Router();

router.get('/cursors', apiKey, async (_req, res) => {
  const rows = await AppDataSource.getRepository(StreamState).find({order: { name: 'ASC' },});
  res.json(rows);
});

router.post('/replay/:source', apiKey, async (req, res, next) => {
  try {
    const src = req.params.source; // device_readings | lab_readings | sweep_readings | device_health
    const full = `sensors.${src}`;
    const r = await streamPlanOnce(
      // @ts-ignore: type narrow at runtime
      require('../services/streamer.service').plans.find((p: any) => p.table === full)
    );
    res.json({ ok: true, ...r });
  } catch (e) { next(e); }
});

export default router;


