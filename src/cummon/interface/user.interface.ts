export interface IPaginationQuery {
  page: number;
  limit: number;
  search?: string;
  userId: string;
}

export interface UpdateActivateDto {
  userId: string;
}
