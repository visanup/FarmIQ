// src/routes/economicData.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { EconomicDataService } from '../services/economic.service';

const econRouter = Router();
const econService = new EconomicDataService();

/** GET /api/economic-data */
econRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await econService.findAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/** GET /api/economic-data/:id */
econRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const item = await econService.findOne(id);
    if (!item) return res.status(404).json({ message: 'EconomicData not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

/** POST /api/economic-data */
econRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newItem = await econService.create(data);
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

/** PUT /api/economic-data/:id */
econRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await econService.update(id, data);
    if (!updated) return res.status(404).json({ message: 'EconomicData not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/economic-data/:id */
econRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await econService.delete(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default econRouter;