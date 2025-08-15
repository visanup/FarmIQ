// src/routes/deviceType.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { DeviceTypeService } from '../services/deviceType.service';

const router = Router();
const service = new DeviceTypeService();

/** GET /api/device-types */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const types = await service.findAll();
    res.json(types);
  } catch (err) {
    next(err);
  }
});

/** GET /api/device-types/:id */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const type = await service.findOne(id);
    if (!type) return res.status(404).json({ message: 'DeviceType not found' });
    res.json(type);
  } catch (err) {
    next(err);
  }
});

/** POST /api/device-types */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newType = await service.create(data);
    res.status(201).json(newType);
  } catch (err) {
    next(err);
  }
});

/** PUT /api/device-types/:id */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const updated = await service.update(id, req.body);
    if (!updated) return res.status(404).json({ message: 'DeviceType not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/device-types/:id */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await service.delete(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;