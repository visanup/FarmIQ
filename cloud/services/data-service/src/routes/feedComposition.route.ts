// src/routes/feedComposition.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { FeedCompositionService } from '../services/feedComposition.service';

const compRouter = Router();
const compService = new FeedCompositionService();

/** GET /api/feed-composition */
compRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await compService.findAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/** GET /api/feed-composition/:id */
compRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const item = await compService.findOne(id);
    if (!item) return res.status(404).json({ message: 'FeedComposition not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

/** POST /api/feed-composition */
compRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newItem = await compService.create(data);
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

/** PUT /api/feed-composition/:id */
compRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await compService.update(id, data);
    if (!updated) return res.status(404).json({ message: 'FeedComposition not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/feed-composition/:id */
compRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await compService.delete(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default compRouter;