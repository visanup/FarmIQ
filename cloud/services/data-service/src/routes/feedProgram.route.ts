// src/routes/feedProgram.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { FeedProgramService } from '../services/feedProgram.service';

const router = Router();
const service = new FeedProgramService();

/** GET /api/feed-programs */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const programs = await service.findAll();
    res.json(programs);
  } catch (err) {
    next(err);
  }
});

/** GET /api/feed-programs/:id */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const program = await service.findOne(id);
    if (!program) return res.status(404).json({ message: 'FeedProgram not found' });
    res.json(program);
  } catch (err) {
    next(err);
  }
});

/** POST /api/feed-programs */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newProgram = await service.create(data);
    res.status(201).json(newProgram);
  } catch (err) {
    next(err);
  }
});

/** PUT /api/feed-programs/:id */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await service.update(id, data);
    if (!updated) return res.status(404).json({ message: 'FeedProgram not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/feed-programs/:id */
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