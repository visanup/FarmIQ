// src/routes/healthRecord.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { HealthRecordService } from '../services/healthRecord.service';

const hrRouter = Router();
const hrService = new HealthRecordService();

/** GET /api/health-records */
hrRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await hrService.findAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/** GET /api/health-records/:id */
hrRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const item = await hrService.findOne(id);
    if (!item) return res.status(404).json({ message: 'HealthRecord not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

/** POST /api/health-records */
hrRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newItem = await hrService.create(data);
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

/** PUT /api/health-records/:id */
hrRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await hrService.update(id, data);
    if (!updated) return res.status(404).json({ message: 'HealthRecord not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/health-records/:id */
hrRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await hrService.delete(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default hrRouter;