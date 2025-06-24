import { z } from 'zod';

export const removeFileSchema = z.object({
  fileUrl: z.string(),
});
