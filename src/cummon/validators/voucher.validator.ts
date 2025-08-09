import { z } from 'zod';

export const scanVoucherSchema = z.object({
  code: z.string(),
  location: z.string().optional(),
  device: z.string().optional(),
});
