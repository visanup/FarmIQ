// services/economic-service/src/routes/index.ts

import { Router } from 'express';
import economicDataRouter from './economicData.route';

const router = Router();

router.use('/economic-data', economicDataRouter);

export default router;

