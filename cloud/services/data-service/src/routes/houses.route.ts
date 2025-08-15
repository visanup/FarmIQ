// src/routes/house.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { HouseService } from '../services/houses.service';

const router = Router();
const service = new HouseService();

/** GET /api/houses */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const houses = await service.findAll();
    res.json(houses);
  } catch (err) {
    next(err);
  }
});

/** GET /api/houses/:id */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const house = await service.findOne(id);
    if (!house) return res.status(404).json({ message: 'House not found' });
    res.json(house);
  } catch (err) {
    next(err);
  }
});

/** POST /api/houses */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newHouse = await service.create(data);
    res.status(201).json(newHouse);
  } catch (err) {
    next(err);
  }
});

/** PUT /api/houses/:id */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await service.update(id, data);
    if (!updated) return res.status(404).json({ message: 'House not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/houses/:id */
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