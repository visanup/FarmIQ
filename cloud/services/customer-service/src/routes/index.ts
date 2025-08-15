// src/routes/index.ts
import { Router } from 'express';
import subscriptionsRouter from './subscriptions.route';


const router = Router();
router.use('/subscriptions',           subscriptionsRouter);
export default router;
