import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  icon: z.string(),
});

export const updateCategorySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
});
