import { z } from 'zod';
import { createEventSchema } from '../validators/event.validator';

export interface ICreateEvent extends z.infer<typeof createEventSchema> {
  userId: string;
}
