import { z } from 'zod';

export const createOrderSchema = z.object({
  quantity: z.number(),
  eventId: z.string(),
  ticketId: z.string(),
});
