// src/routes/index.ts
import { Router } from 'express';

import feedBatchesRouter from './feedBatches.route';
import physicalQualityRouter from './physicalQuality.route';
import chemicalQualityRouter from './chemicalQuality.route';
import pelletMillConditionRouter from './pelletMillCondition.route';
import mixingConditionRouter from './mixingCondition.route';
import grindingConditionRouter from './grindingCondition.route';
import feedBatchAssignmentsRouter from './feedBatchAssignments.route';

console.log({
  feedBatchesRouter,
  physicalQualityRouter,
  chemicalQualityRouter,
  pelletMillConditionRouter,
  mixingConditionRouter,
  grindingConditionRouter,
  feedBatchAssignmentsRouter,
});

const router = Router();

router.use('/feed-batches', feedBatchesRouter);
router.use('/physical-quality', physicalQualityRouter);
router.use('/chemical-quality', chemicalQualityRouter);
router.use('/pellet-mill-condition', pelletMillConditionRouter);
router.use('/mixing-condition', mixingConditionRouter);
router.use('/grinding-condition', grindingConditionRouter);
router.use('/feed-batch-assignments', feedBatchAssignmentsRouter);

export default router;



