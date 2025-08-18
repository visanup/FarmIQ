// src/routes/customer.route.ts
import { Router } from 'express';
import { CustomerService } from '../services';
import { authenticate, requireTenant, requireRoles } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  PaginationQuery, IdParam, CustomerCreate, CustomerUpdate
} from '../schemas/customer.schemas';

const r = Router();
const svc = new CustomerService();

r.use(authenticate, requireTenant);

// GET /api/customers?q=&page=&limit=&sort=&order=
r.get('/', validate({ query: PaginationQuery }), async (req: any, res, next) => {
  try {
    const { page, limit, q, sort, order } = req.query;
    const data = await svc.list({ tenant_id: req.user.tenant_id, page, limit, q, sort, order });
    res.json(data);
  } catch (e) { next(e); }
});

// GET /api/customers/:id
r.get('/:id', validate({ params: IdParam }), async (req: any, res, next) => {
  try {
    const item = await svc.findOneScoped(req.user.tenant_id, Number(req.params.id));
    if (!item) return res.status(404).json({ message: 'Customer not found' });
    res.json(item);
  } catch (e) { next(e); }
});

// POST /api/customers
r.post(
  '/',
  requireRoles('admin', 'manager'),
  validate({ body: CustomerCreate }),
  async (req: any, res, next) => {
    try {
      const created = await svc.create({ ...req.body, tenant_id: req.user.tenant_id });
      res.status(201).json(created);
    } catch (e) { next(e); }
  }
);

// PUT /api/customers/:id
r.put(
  '/:id',
  requireRoles('admin', 'manager'),
  validate({ params: IdParam, body: CustomerUpdate }),
  async (req: any, res, next) => {
    try {
      const updated = await svc.updateScoped(req.user.tenant_id, Number(req.params.id), req.body);
      if (!updated) return res.status(404).json({ message: 'Customer not found' });
      res.json(updated);
    } catch (e) { next(e); }
  }
);

// DELETE /api/customers/:id  (soft delete)
r.delete(
  '/:id',
  requireRoles('admin'),
  validate({ params: IdParam }),
  async (req: any, res, next) => {
    try {
      await svc.softDeleteScoped(req.user.tenant_id, Number(req.params.id));
      res.status(204).send();
    } catch (e) { next(e); }
  }
);

export default r;

