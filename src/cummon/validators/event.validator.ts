import { z } from 'zod';

export const createEventSchema = z.object({
  name: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
  banner: z.string(),
  isFeatured: z.boolean(),
  isOnline: z.boolean(),
  isPublish: z.boolean().default(false),
  region: z.number(),
  coordinates: z.array(z.number()),
  categoryId: z.string(),
});
