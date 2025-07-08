import { z } from 'zod';

export const createEventSchema = z.object({
  name: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
  banner: z.string(),
  isFeatured: z.boolean(),
  isOnline: z.boolean(),
  isPublished: z.boolean().default(false),
  region: z.number(),
  address: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  categoryId: z.string(),
});

export const updateEventSchema = z.object({
  name: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
  banner: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isOnline: z.boolean().optional(),
  isPublished: z.boolean().default(false).optional(),
  region: z.number().optional(),
  address: z.string().optional(),
  latitude: z.number().optional().optional(),
  longitude: z.number().optional().optional(),
  categoryId: z.string().optional(),
});
