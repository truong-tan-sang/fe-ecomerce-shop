// Cart and CartItem DTOs - mirrors backend OpenAPI schema
import type { ProductVariantWithMediaEntity } from "./product";

export interface CartDto {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCartDto {
  userId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateCartDto {
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItemDto {
  id: number;
  cartId: number;
  productVariantId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCartItemDto {
  cartId: number;
  productVariantId: number;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateCartItemDto {
  cartId?: number;
  productVariantId?: number;
  quantity?: number;
  createdAt?: string;
  updatedAt?: string;
}

// API response entities (matches OpenAPI schema)
export interface CartItemWithVariantEntity {
  id: number;
  cartId: number;
  productVariantId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  productVariant: ProductVariantWithMediaEntity;
}

export interface CartDetailEntity {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  cartItems: CartItemWithVariantEntity[];
}

// Extended types for UI with product details
export interface CartItemWithDetails extends CartItemDto {
  productName?: string;
  variantSize?: string | null;
  variantColor?: string | null;
  price?: number;
  imageUrl?: string | null;
}

export interface CartWithDetails extends CartDto {
  items: CartItemWithDetails[];
}

// Shared mapping: API entity → UI detail type
export function mapCartItemToDetails(ci: CartItemWithVariantEntity): CartItemWithDetails {
  return {
    id: ci.id,
    cartId: ci.cartId,
    productVariantId: ci.productVariantId,
    quantity: ci.quantity,
    createdAt: ci.createdAt,
    updatedAt: ci.updatedAt,
    productName: ci.productVariant?.variantName ?? undefined,
    variantSize: ci.productVariant?.variantSize ?? null,
    variantColor: ci.productVariant?.variantColor ?? null,
    price: ci.productVariant?.price ?? 0,
    imageUrl: ci.productVariant?.media?.[0]?.url ?? null,
  };
}
