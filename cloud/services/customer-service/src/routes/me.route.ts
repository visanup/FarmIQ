// src/routes/me.route.ts

import { Router } from 'express';
import { MeService } from '../services';
import { authenticate, requireTenant } from '../middlewares/auth';

const r = Router();
const svc = new MeService();

// GET /api/me/customers
r.get('/customers', authenticate, requireTenant, async (req: any, res, next) => {
  try {
    const items = await svc.myCustomers(req.user.sub, req.user.tenant_id);
    res.json(items);
  } catch (e) { next(e); }
});

export default r;
