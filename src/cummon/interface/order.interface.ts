import { z } from 'zod';
import { createOrderSchema } from '../validators/order.validator';

export interface CreateOrderDto extends z.infer<typeof createOrderSchema> {
  createById: string;
  updatedById: string;
  orderId: string;
}

export interface IPaginationQuery {
  page: number;
  limit: number;
  search?: string;
}
