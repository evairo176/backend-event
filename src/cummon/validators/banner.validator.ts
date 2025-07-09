import { z } from 'zod';

export const createBannerSchema = z.object({
  title: z.string(),
  image: z.string(),
  isShow: z.boolean(),
});

export const updateBannerSchema = z.object({
  title: z.string().optional(),
  image: z.string().optional(),
  isShow: z.boolean().optional(),
});
