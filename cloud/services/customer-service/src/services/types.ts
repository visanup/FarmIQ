export type SortOrder = 'ASC' | 'DESC';

export interface Pagination {
  page?: number;
  limit?: number;
  sort?: string;
  order?: SortOrder;
  q?: string;
}

export interface Scoped {
  tenant_id: string;
}
