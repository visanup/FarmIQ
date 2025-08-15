// src/routes/performanceMetric.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { PerformanceMetricService } from '../services/performanceMetric.service';

const pmRouter = Router();
const pmService = new PerformanceMetricService();

/** GET /api/performance-metrics */
pmRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await pmService.findAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/** GET /api/performance-metrics/:id/:date */
pmRouter.get('/:id/:date', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const date = req.params.date;
    const item = await pmService.findOne(id, date);
    if (!item) return res.status(404).json({ message: 'PerformanceMetric not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

/** POST /api/performance-metrics */
pmRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newItem = await pmService.create(data);
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

/** PUT /api/performance-metrics/:id/:date */
pmRouter.put('/:id/:date', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const date = req.params.date;
    const data = req.body;
    const updated = await pmService.update(id, date, data);
    if (!updated) return res.status(404).json({ message: 'PerformanceMetric not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/performance-metrics/:id/:date */
pmRouter.delete('/:id/:date', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const date = req.params.date;
    await pmService.delete(id, date);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default pmRouter;