// src/routes/device.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { DeviceService } from '../services/device.service';

const router = Router();
const service = new DeviceService();

/**
 * GET /api/devices
 * Fetch all devices
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const devices = await service.findAll();
    res.json(devices);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/devices/:id
 * Fetch device by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid device ID parameter' });
    }
    const device = await service.findOne(id);
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    res.json(device);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/devices
 * Create a new device
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newDevice = await service.create(data);
    res.status(201).json(newDevice);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/devices/:id
 * Update device by ID
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid device ID parameter' });
    }
    const updated = await service.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Device not found' });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/devices/:id
 * Delete device by ID
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid device ID parameter' });
    }
    await service.delete(id);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;

