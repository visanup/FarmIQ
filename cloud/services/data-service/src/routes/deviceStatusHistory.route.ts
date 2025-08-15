// src/routes/deviceStatusHistory.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { DeviceStatusHistoryService } from '../services/deviceStatusHistory.service';

const router = Router();
const service = new DeviceStatusHistoryService();

/**
 * GET /api/device-status-history
 * Fetch all status history entries, optionally filtered by device_id query param.
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deviceIdParam = req.query.device_id as string;
      const deviceId = deviceIdParam ? Number(deviceIdParam) : undefined;
      const list = deviceId
        ? await service.findAll({ device_id: deviceId })
        : await service.findAll();
      res.json(list);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/device-status-history/:id
 * Fetch a single status history record by ID.
 */
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const record = await service.findOne(id);
      if (!record) return res.status(404).json({ message: 'Status history not found' });
      res.json(record);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/device-status-history
 * Create a new status history record.
 */
router.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const newRecord = await service.create(data);
      res.status(201).json(newRecord);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /api/device-status-history/:id
 * Update an existing status history record.
 */
router.put(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const updated = await service.update(id, req.body);
      if (!updated) return res.status(404).json({ message: 'Status history not found' });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /api/device-status-history/:id
 * Delete a status history record.
 */
router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      await service.delete(id);
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  }
);

export default router;

