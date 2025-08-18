// src/routes/index.ts

import { Router } from 'express';
import customersRouter from './contacts.route';
import subscriptionsRouter from './subscriptions.route';
import contactsRouter from './contacts.route';
import membersRouter from './customer-users.route';
import plansRouter from './plans.route';
import meRouter from './me.route';

const r = Router();

r.use('/customers', customersRouter);
r.use('/subscriptions', subscriptionsRouter);
r.use('/plans', plansRouter);
r.use('/me', meRouter);

// nested
r.use('/customers/:customerId/contacts', contactsRouter);
r.use('/customers/:customerId/members', membersRouter);

export default r;


