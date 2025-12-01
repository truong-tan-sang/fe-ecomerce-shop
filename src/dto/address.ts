/**
 * Address DTOs based on OpenAPI schema
 * Following .cursorrules: strict typing from openapi.json
 */

export interface CreateAddressDto {
  userId: number;
  street: string;
  ward: string;
  district: string;
  province: string;
  zipCode: string;
  country: string;
  createdAt?: string; // Optional as per cart/order DTO pattern
  updatedAt?: string; // Optional as per cart/order DTO pattern
}

export interface UpdateAddressDto {
  userId?: number;
  street?: string;
  ward?: string;
  district?: string;
  province?: string;
  zipCode?: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressDto {
  id: number;
  userId: number;
  street: string;
  ward: string;
  district: string;
  province: string;
  zipCode: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Extended DTO for address display with additional UI fields
 */
export interface AddressWithMeta extends AddressDto {
  recipientName?: string;
  recipientPhone?: string;
  isDefault?: boolean;
}
