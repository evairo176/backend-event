import { z } from 'zod';
import { createEventSchema } from '../validators/event.validator';

export type ICreateEvent = z.infer<typeof createEventSchema>;
