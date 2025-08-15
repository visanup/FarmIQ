// src/routes/index.ts
import { Router } from 'express';

import deviceGroupRouter from './deviceGroup.route';
import deviceTypesRouter from './deviceType.route';
import devicesRouter from './device.route';
import devicesLogsRouter from './deviceLogs.route';
import deviceStatusHistoryRouter from './deviceStatusHistory.route';

const router = Router();

router.use('/devices/device-groups',   deviceGroupRouter);
router.use('/devices/device-types',    deviceTypesRouter);
router.use('/devices/device-logs',     devicesLogsRouter);
router.use('/devices/device-status-history',   deviceStatusHistoryRouter);
router.use('/devices',                 devicesRouter);

export default router;
