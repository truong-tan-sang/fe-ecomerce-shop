// Product DTOs aligned with backend OpenAPI schema

export interface ProductDto {
  id: string;
  name: string;
  description: string;
  price: number;
  stockKeepingUnit: string;
  stock: number;
  createByUserId?: number;
  imageUrl?: string;
  image?: string;
  colors?: Array<{ color: string; selected?: boolean }>;
  // Add other fields as returned by backend
  [key: string]: unknown;
}

export interface PaginationMeta {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
  prev: number | null;
  next: number | null;
}

export interface PaginatedProductsResponse {
  data: ProductDto[];
  meta: PaginationMeta;
}

export interface GetProductsParams {
  page?: number;
  perPage?: number;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  stockKeepingUnit: string;
  stock: number;
  createByUserId: number;
  categoryId: number;
  voucherId?: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stockKeepingUnit?: string;
  stock?: number;
  createByUserId?: number;
}
