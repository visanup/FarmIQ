import { z } from 'zod';

// Customer schemas
export const CreateCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const UpdateCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const CustomerResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdById: z.string(),
});

// Plan schemas
export const CreatePlanSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  currency: z.string().default('THB'),
  duration: z.number().int().positive('Duration must be positive'),
  features: z.record(z.any()).optional(),
});

export const UpdatePlanSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive').optional(),
  currency: z.string().optional(),
  duration: z.number().int().positive('Duration must be positive').optional(),
  features: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
});

export const PlanResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  currency: z.string(),
  duration: z.number(),
  features: z.record(z.any()).nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Subscription schemas
export const CreateSubscriptionSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  planId: z.string().min(1, 'Plan ID is required'),
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format').optional(),
});

export const UpdateSubscriptionSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'CANCELLED']).optional(),
  endDate: z.string().datetime('Invalid end date format').optional(),
});

export const SubscriptionResponseSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  planId: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'CANCELLED']),
  startDate: z.date(),
  endDate: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdById: z.string(),
});

// Contact schemas
export const CreateContactSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  type: z.enum(['PHONE', 'EMAIL', 'ADDRESS', 'OTHER']),
  value: z.string().min(1, 'Value is required'),
  isPrimary: z.boolean().default(false),
});

export const UpdateContactSchema = z.object({
  type: z.enum(['PHONE', 'EMAIL', 'ADDRESS', 'OTHER']).optional(),
  value: z.string().min(1, 'Value is required').optional(),
  isPrimary: z.boolean().optional(),
});

export const ContactResponseSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  type: z.enum(['PHONE', 'EMAIL', 'ADDRESS', 'OTHER']),
  value: z.string(),
  isPrimary: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Pagination schemas
export const PaginationQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  search: z.string().optional(),
});

// Type exports
export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;
export type CustomerResponse = z.infer<typeof CustomerResponseSchema>;
export type CreatePlanInput = z.infer<typeof CreatePlanSchema>;
export type UpdatePlanInput = z.infer<typeof UpdatePlanSchema>;
export type PlanResponse = z.infer<typeof PlanResponseSchema>;
export type CreateSubscriptionInput = z.infer<typeof CreateSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof UpdateSubscriptionSchema>;
export type SubscriptionResponse = z.infer<typeof SubscriptionResponseSchema>;
export type CreateContactInput = z.infer<typeof CreateContactSchema>;
export type UpdateContactInput = z.infer<typeof UpdateContactSchema>;
export type ContactResponse = z.infer<typeof ContactResponseSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;