export interface CreateCategoryDto {
  name: string;
  description?: string;
  icon: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  icon?: string;
}

export interface IPaginationQuery {
  page: number;
  limit: number;
  search?: string;
}
