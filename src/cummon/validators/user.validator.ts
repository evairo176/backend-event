import { z } from 'zod';

export const updateActivateSchema = z.object({
  userId: z.string(),
  value: z.boolean(),
});
