// src/routes/subscription.route.ts
import { Router } from 'express';
import { SubscriptionService } from '../services';
import { authenticate, requireTenant, requireRoles } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  IdParam, SubscriptionCreate, SubscriptionUpdate, SubscriptionIdParam, ChangePlanBody
} from '../schemas/customer.schemas';

const r = Router();
const svc = new SubscriptionService();

r.use(authenticate, requireTenant);

// GET /api/subscriptions
r.get('/', async (req: any, res, next) => {
  try {
    const items = await svc.list(req.user.tenant_id);
    res.json(items);
  } catch (e) { next(e); }
});

// POST /api/subscriptions
r.post(
  '/',
  requireRoles('admin', 'manager'),
  validate({ body: SubscriptionCreate }),
  async (req: any, res, next) => {
    try {
      const created = await svc.createScoped(req.user.tenant_id, req.body);
      res.status(201).json(created);
    } catch (e) { next(e); }
  }
);

// PUT /api/subscriptions/:id
r.put(
  '/:id',
  requireRoles('admin', 'manager'),
  validate({ params: SubscriptionIdParam, body: SubscriptionUpdate }),
  async (req: any, res, next) => {
    try {
      const updated = await svc.updateScoped(req.user.tenant_id, Number(req.params.id), req.body);
      if (!updated) return res.status(404).json({ message: 'Subscription not found' });
      res.json(updated);
    } catch (e) { next(e); }
  }
);

// POST /api/subscriptions/:id/change-plan
r.post(
  '/:id/change-plan',
  requireRoles('admin', 'manager'),
  validate({ params: SubscriptionIdParam, body: ChangePlanBody }),
  async (req: any, res, next) => {
    try {
      const out = await svc.changePlan(req.user.tenant_id, Number(req.params.id), req.body.plan_code);
      if (!out) return res.status(404).json({ message: 'Subscription not found' });
      res.json(out);
    } catch (e) { next(e); }
  }
);

// POST /api/subscriptions/:id/pause|resume|cancel
r.post('/:id/pause',  requireRoles('admin','manager'), validate({ params: SubscriptionIdParam }),
  async (req:any,res,next)=>{ try { res.json(await svc.pause(req.user.tenant_id, Number(req.params.id))); } catch(e){ next(e);} });

r.post('/:id/resume', requireRoles('admin','manager'), validate({ params: SubscriptionIdParam }),
  async (req:any,res,next)=>{ try { res.json(await svc.resume(req.user.tenant_id, Number(req.params.id))); } catch(e){ next(e);} });

r.post('/:id/cancel', requireRoles('admin','manager'), validate({ params: SubscriptionIdParam }),
  async (req:any,res,next)=>{ try { res.json(await svc.cancel(req.user.tenant_id, Number(req.params.id))); } catch(e){ next(e);} });

export default r;

