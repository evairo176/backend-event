import { z } from 'zod';

export const createTicketSchema = z.object({
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  description: z.string(),
  eventId: z.string(),
});

export const updateTicketSchema = z.object({
  name: z.string().optional(),
  price: z.number().optional(),
  quantity: z.number().optional(),
  description: z.string(),
  eventId: z.string().optional(),
});
