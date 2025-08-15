// src/routes/index.ts
import { Router } from 'express';

import farmsRouter from './farms.route';
import housesRouter from './houses.route';
import animalsRouter from './animal.route';
import geneticFactorsRouter from './geneticFactor.route';
import feedProgramsRouter from './feedProgram.route';
import feedIntakeRouter from './feedIntake.route';
import envFactorsRouter from './envFactor.route';
import housingConditionsRouter from './housingCondition.route';
import waterQualityRouter from './waterQuality.route';
import healthRecordsRouter from './healthRecord.route';
import welfareIndicatorsRouter from './welfareIndicator.route';
import performanceMetricsRouter from './performanceMetric.route';
import operationRecordsRouter from './operationRecord.route';


const router = Router();

router.use('/farms',                   farmsRouter);
router.use('/houses',                  housesRouter);
router.use('/animals',                 animalsRouter);
router.use('/genetic-factors',         geneticFactorsRouter);
router.use('/feed-programs',           feedProgramsRouter);
router.use('/feed-intake',             feedIntakeRouter);
router.use('/environmental-factors',   envFactorsRouter);
router.use('/housing-conditions',      housingConditionsRouter);
router.use('/water-quality',           waterQualityRouter);
router.use('/health-records',          healthRecordsRouter);
router.use('/welfare-indicators',      welfareIndicatorsRouter);
router.use('/performance-metrics',     performanceMetricsRouter);
router.use('/operation-records',       operationRecordsRouter);

export default router;
