// src/routes/index.ts
import { Router } from 'express';
import alertRouter from './alert.routes';

const router = Router();

// Mount routes
router.use('/api', alertRouter);

export default router;
