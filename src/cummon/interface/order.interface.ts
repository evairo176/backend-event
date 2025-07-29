import { z } from 'zod';
import { createOrderSchema } from '../validators/order.validator';

export interface CreateOrderDto {
  createById: string;
  updatedById: string;
  orderId: string;
}

export interface orderItemDto {
  quantity: number;
  eventId: string;
  ticketId: string;
}

export interface IPaginationQuery {
  page: number;
  limit: number;
  search?: string;
  createById?: string;
  filter?: string;
}
