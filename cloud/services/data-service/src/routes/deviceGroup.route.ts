// src/routes/deviceGroup.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { DeviceGroupService } from '../services/deviceGroup.service';

const router = Router();
const service = new DeviceGroupService();

/** GET /api/device-groups */
router.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const list = await service.findAll();
      res.json(list);
    } catch (err) {
      next(err);
    }
  }
);

/** GET /api/device-groups/:id */
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const group = await service.findOne(id);
      if (!group) return res.status(404).json({ message: 'DeviceGroup not found' });
      res.json(group);
    } catch (err) {
      next(err);
    }
  }
);

/** POST /api/device-groups */
router.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const newGroup = await service.create(data);
      res.status(201).json(newGroup);
    } catch (err) {
      next(err);
    }
  }
);

/** PUT /api/device-groups/:id */
router.put(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const updated = await service.update(id, req.body);
      if (!updated) return res.status(404).json({ message: 'DeviceGroup not found' });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

/** DELETE /api/device-groups/:id */
router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      await service.delete(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
