// src/routes/index.ts
import { Router } from 'express';

import farmsRouter from './farms.route';
import housesRouter from './houses.route';
import animalsRouter from './animal.route';
import batchsRouter from './batches.route';


const router = Router();

router.use('/farms',farmsRouter);
router.use('/houses',housesRouter);
router.use('/animals',animalsRouter);
router.use('/batchs',batchsRouter);

export default router;
