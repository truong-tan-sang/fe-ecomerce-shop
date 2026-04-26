// Product Detail DTOs - mirrors backend OpenAPI schema

import type { MediaEntity } from "@/dto/product";

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
  media?: MediaEntity[];
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
