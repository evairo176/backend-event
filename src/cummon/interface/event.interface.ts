import { z } from 'zod';
import {
  createEventSchema,
  updateEventSchema,
} from '../validators/event.validator';

export interface ICreateEvent extends z.infer<typeof createEventSchema> {
  userId: string;
}
export interface IUpdateEvent extends z.infer<typeof updateEventSchema> {
  userId: string;
}
export interface IPaginationQuery {
  page: number;
  limit: number;
  search?: string;
}
