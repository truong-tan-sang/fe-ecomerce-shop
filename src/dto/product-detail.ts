// Product Detail DTOs - mirrors backend OpenAPI schema

export interface ProductDetailDto {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stockKeepingUnit: string;
  stock: number;
  categoryId: number;
  createByUserId: number;
  createdAt: string;
  updatedAt: string;
  voucherId: number | null;
  shopOfficeId: number;
}

export interface ProductVariantDto {
  id: number;
  productId: number;
  createByUserId: number;
  variantName: string;
  variantColor: string | null;
  variantSize: string | null;
  price: number;
  stock: number;
  stockKeepingUnit: string;
  createdAt: string;
  updatedAt: string;
  voucherId: number | null;
}

export interface MediaDto {
  id: number;
  url: string;
  altText: string | null;
  type: string;
  productVariantId: number | null;
  reviewId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewDto {
  id: number;
  userId: number;
  productId: number | null;
  productVariantId: number | null;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewWithMedia extends ReviewDto {
  medias?: MediaDto[];
}

export interface CreateReviewDto {
  productId: number;
  userId: number;
  productVariantId: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateReviewDto {
  productId?: number;
  userId?: number;
  productVariantId?: number;
  rating?: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Aggregated product data for display
export interface AggregatedProductData {
  product: ProductDetailDto;
  variants: ProductVariantDto[];
  reviews: ReviewDto[];
  averageRating: number;
  reviewCount: number;
  availableSizes: string[];
  availableColors: Array<{ color: string; name: string }>;
  images: string[];
  minPrice: number;
  maxPrice: number;
}
