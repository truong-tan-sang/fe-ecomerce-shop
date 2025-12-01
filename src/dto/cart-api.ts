// Cart and CartItem DTOs - mirrors backend OpenAPI schema

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
