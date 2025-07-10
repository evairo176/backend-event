import { z } from 'zod';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../validators/category.validator';

export interface CreateBannerDto extends z.infer<typeof createCategorySchema> {
  createById: string;
  updatedById: string;
}

export interface UpdateBannerDto extends z.infer<typeof updateCategorySchema> {
  updatedById: string;
}

export interface IPaginationQuery {
  page: number;
  limit: number;
  search?: string;
}
