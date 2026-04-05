export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

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
