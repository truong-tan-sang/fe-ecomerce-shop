/**
 * Address DTOs based on OpenAPI schema
 */

// ── Base Address DTOs ──

export interface CreateAddressDto {
  userId: number;
  street: string;
  ward: string;
  district: string;
  province: string;
  zipCode: string;
  country: string;
}

export interface UpdateAddressDto {
  userId?: number;
  street?: string;
  ward?: string;
  district?: string;
  province?: string;
  zipCode?: string;
  country?: string;
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

export interface AddressWithMeta extends AddressDto {
  recipientName?: string;
  recipientPhone?: string;
  isDefault?: boolean;
}

// ── Order Address DTOs (GHN-validated) ──

export interface DatabaseAddressDto {
  id: number;
  userId: number | null;
  street: string;
  ward: string;
  district: string;
  province: string;
  zipCode: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export interface GhnProvinceDto {
  ProvinceID: number;
  ProvinceName: string;
  CountryID: number;
  Code: string;
  NameExtension: string[];
  IsEnable: number;
  Status: number;
  RegionID: number;
  RegionCPN: number;
  CreatedAt: string;
  UpdatedAt: string;
  UpdatedBy: number;
  UpdatedIP: string;
  UpdatedEmployee: number;
  UpdatedSource: string;
  UpdatedDate: string;
}

export interface GhnDistrictDto {
  DistrictID: number;
  ProvinceID: number;
  DistrictName: string;
  Code: string;
  Type: number;
  SupportType: number;
  NameExtension: string[];
  CanUpdateCOD: boolean;
  PickType: number;
  DeliverType: number;
  ReasonCode: string;
  ReasonMessage: string;
  OnDates: unknown[] | null;
  WhiteListClient: WhiteListClientDto;
  WhiteListWard: WhiteListWardDto;
  Status: number;
  CreatedAt: string;
  UpdatedAt: string;
  UpdatedBy: number;
  UpdatedIP: string;
  UpdatedEmployee: number;
  UpdatedSource: string;
  UpdatedDate: string;
}

export interface GhnWardDto {
  WardCode: string;
  DistrictID: number;
  WardName: string;
  NameExtension: string[];
  CanUpdateCOD: boolean;
  SupportType: number;
  PickType: number;
  DeliverType: number;
  ReasonCode: string;
  ReasonMessage: string;
  OnDates: unknown[] | null;
  WhiteListClient: WhiteListClientDto;
  WhiteListWard: WhiteListWardDto;
  Status: number;
  CreatedAt: string;
  UpdatedAt: string;
  UpdatedBy: number;
  UpdatedIP: string;
  UpdatedEmployee: number;
  UpdatedSource: string;
  UpdatedDate: string;
}

export interface WhiteListClientDto {
  From: unknown[];
  To: unknown[];
  Return: unknown[];
}

export interface WhiteListWardDto {
  From: unknown | null;
  To: unknown | null;
}

export interface OrderAddressInGHNDto {
  toProvince: GhnProvinceDto;
  toDistrict: GhnDistrictDto;
  toWard: GhnWardDto;
}

export interface CreateAddressForOrderResponseDto {
  orderAddressInDb: DatabaseAddressDto;
  orderAddressInGHN: OrderAddressInGHNDto;
}
