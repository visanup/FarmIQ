// src/routes/operationRecord.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { OperationRecordService } from '../services/operationRecord.service';

const orRouter = Router();
const orService = new OperationRecordService();

/** GET /api/operational-records */
orRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await orService.findAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/** GET /api/operational-records/:id */
orRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const item = await orService.findOne(id);
    if (!item) return res.status(404).json({ message: 'OperationRecord not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

/** POST /api/operational-records */
orRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newItem = await orService.create(data);
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

/** PUT /api/operational-records/:id */
orRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await orService.update(id, data);
    if (!updated) return res.status(404).json({ message: 'OperationRecord not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/operational-records/:id */
orRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await orService.delete(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default orRouter;