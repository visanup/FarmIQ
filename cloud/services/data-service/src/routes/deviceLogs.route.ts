// src/routes/deviceLog.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { DeviceLogService } from '../services/deviceLogs.service';

const router = Router();
const service = new DeviceLogService();

/**
 * GET /api/device-logs
 * Optionally filter by ?device_id=#
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  console.log('GET all device-logs route, query:', req.query);
  try {
    const logs = await service.findAll();
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/device-logs/:id
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  console.log('GET device-log by id route, id param:', req.params.id);
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid log id parameter' });
    }

    const log = await service.findOne(id);
    if (!log) return res.status(404).json({ message: 'DeviceLog not found' });
    res.json(log);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/device-logs
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;

    // Basic validation example
    if (!data.device_id || !data.event_type) {
      return res.status(400).json({ error: 'Missing required fields: device_id, event_type' });
    }

    const newLog = await service.create(data);
    res.status(201).json(newLog);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/device-logs/:id
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid log id parameter' });
    }

    const updated = await service.update(id, req.body);
    if (!updated) return res.status(404).json({ message: 'DeviceLog not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/device-logs/:id
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid log id parameter' });
    }

    await service.delete(id);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;
