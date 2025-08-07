import { z } from 'zod';

export const emailSchema = z.string().trim().email().min(1).max(255);
export const userNameSchema = z.string().trim().min(1).max(50);

export const addUserSchema = z.object({
  fullname: z.string().trim().min(1).max(255),
  username: userNameSchema,
  email: emailSchema,
});

export const updateActivateSchema = z.object({
  userId: z.string(),
  value: z.boolean(),
});
