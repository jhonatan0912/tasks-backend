export interface Response<T> {
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMetaResponse;
  message: string;
}

interface PaginatedMetaResponse {
  page: number;
  limit: number;
  total: number;
  lastPage: number;
}
