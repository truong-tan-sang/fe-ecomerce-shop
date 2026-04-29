export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface VoucherTargetProduct {
  id: number;
  name: string;
}

export interface VoucherTargetCategory {
  id: number;
  name: string;
}

export interface VoucherTargetVariant {
  id: number;
  variantName: string;
  variantSize: string;
  colorId: number;
}

export interface VoucherTargetUserVoucher {
  userId: number;
  voucherStatus: "AVAILABLE" | "SAVED" | "USED" | "EXPIRED";
}

export interface VoucherDto {
  id: number;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  validFrom: string;
  validTo: string;
  usageLimit: number | null;
  timesUsed: number;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  voucherForProduct: VoucherTargetProduct[];
  voucherForCategory: VoucherTargetCategory[];
  voucherForSpecialProductVariant: VoucherTargetVariant[];
  userVouchers: VoucherTargetUserVoucher[];
}

export interface CreateVoucherDto {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  timesUsed: number;
  isActive: boolean;
  createdBy: number;
}

export interface SearchVoucherParams {
  code?: string;
  discountType?: DiscountType;
  isActive?: boolean;
}

export interface UpdateVoucherDto {
  code?: string;
  description?: string;
  discountType?: DiscountType;
  discountValue?: number;
  validFrom?: string;
  validTo?: string;
  usageLimit?: number;
  timesUsed?: number;
  isActive?: boolean;
}

export type VoucherTargetType = "none" | "category" | "product" | "variant" | "user";

export interface UserVoucherDto {
  id: string;
  userId: string;
  voucherId: string;
  voucherStatus: "AVAILABLE" | "SAVED" | "USED" | "EXPIRED";
  saveVoucherAt: string;
  useVoucherAt: string | null;
  voucher: VoucherDto;
}

export interface CreateUserVoucherDto {
  userId: number;
  voucherId: number;
  voucherStatus: "AVAILABLE" | "SAVED";
}
