// src/schemas/customer.schemas.ts
import { z } from '../utils/zod';

// --- params ---
export const IdParam = z.object({ id: z.coerce.number().int().positive() });
export const SubscriptionIdParam = z.object({ id: z.coerce.number().int().positive() });
export const CustomerIdParam = z.object({ customerId: z.coerce.number().int().positive() });
export const ContactIdParam  = z.object({
  customerId: z.coerce.number().int().positive(),
  contactId:  z.coerce.number().int().positive(),
});
export const MemberIdParam   = z.object({
  customerId: z.coerce.number().int().positive(),
  memberId:   z.coerce.number().int().positive(),
});
export const PlanCodeParam = z.object({ plan_code: z.string().min(1) });

// --- list ---
export const PaginationQuery = z.object({
  q: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['created_at','name']).default('created_at'),
  order: z.enum(['asc','desc']).default('desc'),
});

// --- customers ---
export const CustomerBase = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  address: z.string().optional(),
  billing_info: z.record(z.unknown()).optional(),
  external_id: z.string().max(128).optional(),
});
export const CustomerCreate = CustomerBase;
export const CustomerUpdate = CustomerBase.partial();

// --- subscriptions ---
export const SubscriptionCreate = z.object({
  customer_id: z.coerce.number().int().positive(),
  plan_code: z.string().min(1),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().optional(),
  status: z.enum(['active','paused','canceled','expired']).default('active'),
  meta: z.record(z.unknown()).optional(),
});
export const SubscriptionUpdate = SubscriptionCreate.partial();
export const ChangePlanBody = z.object({ plan_code: z.string().min(1) });

// --- contacts ---
export const ContactCreate = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  role: z.string().max(64).optional(),
});
export const ContactUpdate = ContactCreate.partial();

// --- members ---
export const MemberAddBody = z.object({
  user_id: z.string().min(1),
  role: z.enum(['owner','admin','member','viewer']).default('member'),
});

// --- plans ---
export const PlanUpsert = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  entitlements: z.record(z.unknown()).optional(),
  is_active: z.boolean().optional(),
});







