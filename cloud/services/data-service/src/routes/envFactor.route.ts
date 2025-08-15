// src/routes/envFactor.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { EnvFactorService } from '../services/envFactor.service';

const router = Router();
const service = new EnvFactorService();

/** GET /api/env-factors */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await service.findAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/** GET /api/env-factors/:id */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const item = await service.findOne(id);
    if (!item) return res.status(404).json({ message: 'EnvironmentalFactor not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

/** POST /api/env-factors */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newItem = await service.create(data);
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

/** PUT /api/env-factors/:id */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await service.update(id, data);
    if (!updated) return res.status(404).json({ message: 'EnvironmentalFactor not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/env-factors/:id */
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