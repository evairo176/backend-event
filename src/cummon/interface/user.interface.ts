import { z } from 'zod';
import { addUserSchema } from '../validators/user.validator';

export interface IPaginationQuery {
  page: number;
  limit: number;
  search?: string;
  userId?: string;
  companyId?: string;
}

export interface UpdateActivateDto {
  userId: string;
  value: boolean;
}

export interface IAddUserEvent extends z.infer<typeof addUserSchema> {
  companyId: string;
}
