// Entity type from API response (matches ProductVariantEntity schema)
export interface ProductVariantEntity {
  id: number;
  productId: number;
  createByUserId: number;
  variantName: string;
  variantColor: string;
  variantSize: string;
  price: number;
  stock: number;
  stockKeepingUnit: string;
  voucherId: number | null;
  createdAt: string;
  updatedAt: string;
}

// DTO for compatibility
export interface ProductVariantDto {
  id: number;
  productId: number;
  createByUserId: number;
  variantName: string;
  variantColor: string;
  variantSize: string;
  price: number;
  stock: number;
  stockKeepingUnit: string;
  voucherId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductVariantDto {
  productId: number;
  createByUserId: number;
  variantName: string;
  variantColor: string;
  variantSize: string;
  price: number;
  stock: number;
  stockKeepingUnit: string;
  voucherId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProductVariantDto {
  productId?: number;
  createByUserId?: number;
  variantName?: string;
  variantColor?: string;
  variantSize?: string;
  price?: number;
  stock?: number;
  stockKeepingUnit?: string;
  voucherId?: number;
}
