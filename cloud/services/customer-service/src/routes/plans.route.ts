// src/routes/plans.route.ts

import { Router } from 'express';
import { PlanCatalogService } from '../services';
import { authenticate, requireRoles } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { PlanUpsert, PlanCodeParam } from '../schemas/customer.schemas';

const r = Router();
const svc = new PlanCatalogService();

// GET /api/plans
r.get('/', authenticate, async (_req, res, next) => {
  try { res.json(await svc.list(true)); } catch (e) { next(e); }
});

// PUT /api/plans/:plan_code  (upsert; admin only)
r.put(
  '/:plan_code',
  authenticate, requireRoles('admin'),
  validate({ params: PlanCodeParam, body: PlanUpsert }),
  async (req, res, next) => {
    try {
      const saved = await svc.upsert({ ...req.body, plan_code: req.params.plan_code } as any);
      res.json(saved);
    } catch (e) { next(e); }
  }
);

export default r;
