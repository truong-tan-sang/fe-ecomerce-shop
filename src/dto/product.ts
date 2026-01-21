// Product DTOs aligned with backend OpenAPI schema

/**
 * Media item for product variants
 * Represents images or videos associated with a product variant
 */
export interface ProductMediaDto {
  id: number;
  productVariantId: number;
  mediaType: "IMAGE" | "VIDEO";
  mediaPath: string;
  createdAt: string; // ISO date-time
  updatedAt: string; // ISO date-time
}

/**
 * Product variant with media
 * Represents a specific variant (color, size, etc.) of a product
 */
export interface ProductVariantWithMediaDto {
  id: number;
  productId: number;
  variantName: string;
  price: number;
  stock: number;
  createdAt: string; // ISO date-time
  updatedAt: string; // ISO date-time
  media: ProductMediaDto[];
}

/**
 * Product DTO with full details from GET /products endpoint
 * Includes product variants and their media
 */
export interface ProductDto {
  id: number;
  name: string;
  description: string;
  price: number;
  stockKeepingUnit: string;
  stock: number;
  createByUserId: number;
  categoryId: number | null;
  voucherId: number | null;
  createdAt: string; // ISO date-time
  updatedAt: string; // ISO date-time
  productVariants: ProductVariantWithMediaDto[];
}

/**
 * Paginated response metadata
 */
export interface PaginationMeta {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
  prev: number | null;
  next: number | null;
}

/**
 * Paginated products response
 * For future use if backend implements pagination metadata in response
 */
export interface PaginatedProductsResponse {
  data: ProductDto[];
  meta: PaginationMeta;
}

/**
 * Parameters for getting all products
 */
export interface GetProductsParams {
  page?: number;
  perPage?: number;
}

/**
 * DTO for creating a new product
 */
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

/**
 * DTO for updating an existing product
 */
export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stockKeepingUnit?: string;
  stock?: number;
  createByUserId?: number;
}

/**
 * Legacy ProductDto for backward compatibility
 * Use ProductDto for new code
 */
export interface ProductLegacyDto {
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
  [key: string]: unknown;
}

