import { z } from 'zod';
import {
  createTicketSchema,
  updateTicketSchema,
} from '../validators/ticket.validator';

export interface ICreateTicket extends z.infer<typeof createTicketSchema> {
  createById: string;
  updatedById: string;
}
export interface IUpdateTicket extends z.infer<typeof updateTicketSchema> {
  updatedById: string;
}
