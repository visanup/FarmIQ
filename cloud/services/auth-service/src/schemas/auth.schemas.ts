// src/schemas/auth.schemas.ts
import { z } from '../utils/zod';

export const CustomerSchema = z.object({
  name: z.string().trim().min(1, 'customer.name is required').max(100),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().max(30).optional(),
});

const PasswordSchema = z
  .string()
  .min(8, 'password must be at least 8 characters')
  .max(128, 'password too long')
  .refine(
    (v: string) => /[A-Za-z]/.test(v) && /[0-9]/.test(v),
    'password must contain letters and numbers'
  );

export const SignupBodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  username: z
    .string()
    .trim()
    .min(3, 'username must be at least 3 chars')
    .max(32, 'username too long')
    .regex(/^[a-zA-Z0-9._-]+$/, 'username allows a-z, 0-9, dot, underscore, dash'),
  password: PasswordSchema,
  customer: CustomerSchema,
});

export const LoginBodySchema = z.object({
  username: z.string().trim().min(1, 'username is required'),
  password: z.string().min(1, 'password is required'),
});

export const RefreshBodySchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken is required'),
});

export type SignupBody = z.infer<typeof SignupBodySchema>;
export type LoginBody = z.infer<typeof LoginBodySchema>;
export type RefreshBody = z.infer<typeof RefreshBodySchema>;



