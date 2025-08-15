// src/routes/subscription.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/subscriptions.service';

const router = Router();
const service = new SubscriptionService();

/** GET /api/subscriptions */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subs = await service.findAll();
    res.json(subs);
  } catch (err) {
    next(err);
  }
});

/** GET /api/subscriptions/:id */
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const sub = await service.findOne(id);
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    res.json(sub);
  } catch (err) {
    next(err);
  }
});

/** POST /api/subscriptions */
router.post('/', async (req, res, next) => {
  try {
    const data = req.body;
    const newSub = await service.create(data);
    res.status(201).json(newSub);
  } catch (err) {
    next(err);
  }
});

/** PUT /api/subscriptions/:id */
router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await service.update(id, data);
    if (!updated) return res.status(404).json({ message: 'Subscription not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/subscriptions/:id */
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
