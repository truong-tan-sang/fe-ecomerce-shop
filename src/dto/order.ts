/**
 * Order DTOs based on OpenAPI schema
 * Following .cursorrules: strict typing from openapi.json
 */

export interface CreateOrderDto {
  shippingAddressId: number;
  userId: number;
  processByStaffId: number;
  orderDate: string; // ISO date-time string
  status: string;
  subTotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  createdAt?: string; // Optional as per cart DTO pattern
  updatedAt?: string; // Optional as per cart DTO pattern
}

export interface UpdateOrderDto {
  shippingAddressId?: number;
  userId?: number;
  processByStaffId?: number;
  orderDate?: string;
  status?: string;
  subTotal?: number;
  shippingFee?: number;
  discount?: number;
  totalAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderDto {
  id: number;
  shippingAddressId: number;
  userId: number;
  processByStaffId: number;
  orderDate: string;
  status: string;
  subTotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemDto {
  orderId: number;
  productVariantId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt?: string; // Optional as per cart DTO pattern
  updatedAt?: string; // Optional as per cart DTO pattern
}

export interface UpdateOrderItemDto {
  orderId?: number;
  productVariantId?: number;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItemDto {
  id: number;
  orderId: number;
  productVariantId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Extended DTO for order display with product details
 */
export interface OrderWithDetails extends OrderDto {
  orderItems?: OrderItemWithDetails[];
}

export interface OrderItemWithDetails extends OrderItemDto {
  productVariant?: {
    id: number;
    variantName: string;
    price: number;
    media?: Array<{ url: string }>;
  };
}
