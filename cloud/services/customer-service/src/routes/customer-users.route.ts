// src/routes/customer-users.route.ts

import { Router } from 'express';
import { CustomerUserService } from '../services';
import { authenticate, requireTenant, requireRoles } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  CustomerIdParam, MemberAddBody, MemberIdParam
} from '../schemas/customer.schemas';

const r = Router({ mergeParams: true });
const svc = new CustomerUserService();

r.use(authenticate, requireTenant);

// GET /api/customers/:customerId/members
r.get('/', validate({ params: CustomerIdParam }), async (req: any, res, next) => {
  try {
    const items = await svc.listMembers(req.user.tenant_id, Number(req.params.customerId));
    res.json(items);
  } catch (e) { next(e); }
});

// POST /api/customers/:customerId/members
r.post(
  '/',
  requireRoles('admin','manager'),
  validate({ params: CustomerIdParam, body: MemberAddBody }),
  async (req: any, res, next) => {
    try {
      const out = await svc.addMember(req.user.tenant_id, Number(req.params.customerId), req.body.user_id, req.body.role);
      res.status(201).json(out);
    } catch (e) { next(e); }
  }
);

// DELETE /api/customers/:customerId/members/:memberId
r.delete(
  '/:memberId',
  requireRoles('admin'),
  validate({ params: MemberIdParam }),
  async (req:any,res,next)=>{
    try{
      await svc.removeMember(req.user.tenant_id, Number(req.params.memberId));
      res.status(204).send();
    } catch(e){ next(e); }
  }
);

export default r;
