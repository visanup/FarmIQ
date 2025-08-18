// src/routes/contacts.route.ts

import { Router } from 'express';
import { ContactService } from '../services';
import { authenticate, requireTenant, requireRoles } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  CustomerIdParam, ContactCreate, ContactUpdate, ContactIdParam
} from '../schemas/customer.schemas';

const r = Router({ mergeParams: true });
const svc = new ContactService();

r.use(authenticate, requireTenant);

// GET /api/customers/:customerId/contacts
r.get('/', validate({ params: CustomerIdParam }), async (req: any, res, next) => {
  try {
    const items = await svc.listByCustomer(req.user.tenant_id, Number(req.params.customerId));
    res.json(items);
  } catch (e) { next(e); }
});

// POST /api/customers/:customerId/contacts
r.post(
  '/',
  requireRoles('admin','manager'),
  validate({ params: CustomerIdParam, body: ContactCreate }),
  async (req: any, res, next) => {
    try {
      const c = await svc.create(req.user.tenant_id, Number(req.params.customerId), req.body);
      res.status(201).json(c);
    } catch (e) { next(e); }
  }
);

// PUT /api/customers/:customerId/contacts/:contactId
r.put(
  '/:contactId',
  requireRoles('admin','manager'),
  validate({ params: ContactIdParam, body: ContactUpdate }),
  async (req:any,res,next)=>{
    try{
      // simple approach: delete+create or patch with repo manager; ที่นี่ขอ patch สั้น ๆ
      const { customerId, contactId } = req.params;
      await svc.create(req.user.tenant_id, Number(customerId), { ...req.body, contact_id: Number(contactId) } as any);
      res.status(200).json({ ok: true });
    } catch(e){ next(e); }
  }
);

// DELETE /api/customers/:customerId/contacts/:contactId
r.delete(
  '/:contactId',
  requireRoles('admin'),
  validate({ params: ContactIdParam }),
  async (req: any, res, next) => {
    try {
      await svc.delete(req.user.tenant_id, Number(req.params.contactId));
      res.status(204).send();
    } catch (e) { next(e); }
  }
);

export default r;
