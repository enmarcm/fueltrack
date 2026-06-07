import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().transform((e) => e.toLowerCase()),
  password: z.string().min(8),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email().transform((e) => e.toLowerCase()),
  password: z.string(),
});

export const refreshSchema = z.object({
  refreshToken: z.string(),
});
