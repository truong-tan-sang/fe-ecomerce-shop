/**
 * Shipment DTOs based on OpenAPI schema
 */

import type { CreateAddressForOrderResponseDto } from "./address";

export interface PreviewOrderItemDto {
  productVariantId: number;
  quantity: number;
}

/** Request body for POST /shipments/preview-shipping-fee-detail-and-discount-detail-and-price-detail-for-order */
export interface PreviewFeeAndDiscountAndPriceForOrderDto {
  orderItems: PreviewOrderItemDto[];
  createNewAddressForOrderResponseDto: CreateAddressForOrderResponseDto;
}
