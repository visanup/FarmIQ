// src/routes/animal.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { AnimalService } from '../services/animal.service';

const router = Router();
const service = new AnimalService();

/** GET /api/animals */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const animals = await service.findAll();
    res.json(animals);
  } catch (err) {
    next(err);
  }
});

/** GET /api/animals/:id */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const animal = await service.findOne(id);
    if (!animal) return res.status(404).json({ message: 'Animal not found' });
    res.json(animal);
  } catch (err) {
    next(err);
  }
});

/** POST /api/animals */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newAnimal = await service.create(data);
    res.status(201).json(newAnimal);
  } catch (err) {
    next(err);
  }
});

/** PUT /api/animals/:id */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await service.update(id, data);
    if (!updated) return res.status(404).json({ message: 'Animal not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/animals/:id */
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