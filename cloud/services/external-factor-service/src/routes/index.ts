// services/external-factor-service/src/routes/index.ts

import { Router } from 'express';
import externalFactorsRouter from './externalFactors.route';

const router = Router();

router.use('/external-factors', externalFactorsRouter);

export default router;


