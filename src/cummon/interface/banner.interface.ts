import { z } from 'zod';
import {
  createBannerSchema,
  updateBannerSchema,
} from '../validators/banner.validator';

export interface CreateBannerDto extends z.infer<typeof createBannerSchema> {
  createById: string;
  updatedById: string;
}

export interface UpdateBannerDto extends z.infer<typeof updateBannerSchema> {
  updatedById: string;
}

export interface IPaginationQuery {
  page: number;
  limit: number;
  search?: string;
}
