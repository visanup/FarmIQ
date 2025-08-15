// src/routes/index.ts

import { Router } from 'express';
import ingestion from './ingestion.routes';

const router = Router();
router.use('/ingest', ingestion);
export default router;
