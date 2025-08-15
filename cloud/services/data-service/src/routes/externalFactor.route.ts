// src/routes/externalFactor.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { ExternalFactorService } from '../services/externalFactor.service';

const extRouter = Router();
const extService = new ExternalFactorService();

/** GET /api/external-factors */
extRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await extService.findAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/** GET /api/external-factors/:id */
extRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const item = await extService.findOne(id);
    if (!item) return res.status(404).json({ message: 'ExternalFactor not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

/** POST /api/external-factors */
extRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newItem = await extService.create(data);
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

/** PUT /api/external-factors/:id */
extRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await extService.update(id, data);
    if (!updated) return res.status(404).json({ message: 'ExternalFactor not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/external-factors/:id */
extRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await extService.delete(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default extRouter;