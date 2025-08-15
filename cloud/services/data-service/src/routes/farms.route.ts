// src/routes/farm.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { FarmService } from '../services/farms.service';

const router = Router();
const service = new FarmService();

/** GET /api/farms */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farms = await service.findAll();
    res.json(farms);
  } catch (err) {
    next(err);
  }
});

/** GET /api/farms/:id */
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const farm = await service.findOne(id);
    if (!farm) return res.status(404).json({ message: 'Farm not found' });
    res.json(farm);
  } catch (err) {
    next(err);
  }
});

/** POST /api/farms */
router.post('/', async (req, res, next) => {
  try {
    const data = req.body;
    const newFarm = await service.create(data);
    res.status(201).json(newFarm);
  } catch (err) {
    next(err);
  }
});

/** PUT /api/farms/:id */
router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await service.update(id, data);
    if (!updated) return res.status(404).json({ message: 'Farm not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/farms/:id */
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await service.delete(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;