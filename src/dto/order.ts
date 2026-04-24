/**
 * Order DTOs based on OpenAPI schema
 * Matches the real backend CreateOrderDto (not the legacy SecondCreateOrderDto)
 */

import type { CreateAddressForOrderResponseDto } from "./address";

// ── Enums ──

export type PaymentMethod = "COD" | "VNPAY";

export type OrderStatus =
  | "PENDING"
  | "PAYMENT_PROCESSING"
  | "PAYMENT_CONFIRMED"
  | "WAITING_FOR_PICKUP"
  | "SHIPPED"
  | "DELIVERED"
  | "DELIVERED_FAILED"
  | "COMPLETED"
  | "CANCELLED"
  | "RETURNED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "CANCELLED";

export type ShipmentStatus =
  | "PENDING"
  | "WAITING_FOR_PICKUP"
  | "SHIPPED"
  | "DELIVERED"
  | "DELIVERED_FAILED"
  | "RETURNED"
  | "CANCELLED";

// ── Package / Shipping Preview DTOs ──

export interface PackageItemDetailDto {
  productVariantId: number;
  productVariantName: string;
  productVariantSize: string;
  productVariantColor: string;
  productVariantSKU: string;
  quantity: number;
  unitPrice: number;
  appliedVoucher: VoucherSnapshot | null;
  discountDescription: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  totalDiscountAmount: number;
  subTotalPrice: number;
  totalPrice: number;
  currencyUnit: string;
}

export interface VoucherSnapshot {
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  timesUsed: number;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface PackageItemDetailForGHNDto {
  name: string;
  code: string;
  quantity: number;
  price: number;
  length: number;
  width: number;
  height: number;
  weight: number;
  category: Record<string, string>;
}

export interface GHNShopDetailDto {
  _id: number;
  name: string;
  phone: string;
  address: string;
  ward_code: string;
  district_id: number;
  client_id: number;
  bank_account_id: number;
  status: number;
  location: { lat: number; lng: number };
  version_no: string;
  is_created_chat_channel: boolean;
}

export interface GetServiceResponseDto {
  service_id: number;
  short_name: string;
  service_type_id: number;
}

export interface CalculateExpectedDeliveryTimeResponseDto {
  leadtime: number;
  order_date: string;
}

export interface PackageDetailDto {
  packageItems: PackageItemDetailDto[];
  packageItemsForGHNCreateNewOrderRequest: PackageItemDetailForGHNDto[];
  userVoucher: UserSavedVoucherDetailEntity | null;
  subTotalPriceForPackage: number;
  specialUserDiscountAmountForPackage: number;
  totalPriceForPackage: number;
  totalWeight: number;
  totalHeight: number;
  maxLength: number;
  maxWidth: number;
  ghnShopId: number;
  ghnShopDetail: GHNShopDetailDto;
  ghnProvinceName: string;
  ghnDistrictName: string;
  ghnWardName: string;
  shippingService: GetServiceResponseDto;
  shippingFee: number;
  expectedDeliveryTime: CalculateExpectedDeliveryTimeResponseDto;
  from_province_id: number;
  from_district_id: number;
  from_ward_code: string;
  to_province_id: number;
  to_district_id: number;
  to_ward_code: string;
  to_user_id: string;
}

export interface UserSavedVoucherDetailEntity {
  id: number;
  voucher: VoucherSnapshot;
  [key: string]: unknown;
}

export interface ChecksumInformationForOrderPreviewDto {
  checksumIdInDB: string | number;
  checksumData: string;
}

export interface PreviewPackageDetailWithChecksumDto {
  PackageDetail: PackageDetailDto;
  checksumInformation: ChecksumInformationForOrderPreviewDto;
}

/** packages key = GHN shop ID string */
export type PackagesForShipping = Record<string, PreviewPackageDetailWithChecksumDto>;

// ── Create Order DTO (real backend) ──

export interface CreateOrderDto {
  userId: number;
  paymentMethod: PaymentMethod;
  carrier: string;
  description?: string;
  phone: string;
  shippingAddress: CreateAddressForOrderResponseDto;
  packages: PackagesForShipping;
}

// ── Order Response DTOs ──

export interface UserInOrderDto {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  username?: string;
  isActive?: boolean;
  userMedia?: Array<{ id: number; url: string; isAvatarFile: boolean; type: string }>;
}

export type RequestInOrderStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "APPROVED"
  | "REJECTED";

export interface ReturnRequestRowInOrder {
  id: number;
  requestId: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}

export interface RequestInOrderDto {
  id: number;
  orderId: number;
  userId: number;
  subject: "RETURN_REQUEST" | string;
  status: RequestInOrderStatus;
  description: string | null;
  processByStaffId: number | null;
  createdAt: string;
  updatedAt: string;
  processByStaff?: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
  returnRequest?: ReturnRequestRowInOrder[];
}

export interface OrderFullInformationEntity {
  id: number;
  userId: number;
  shippingAddressId: number;
  processByStaffId: number | null;
  ghnPickShiftId: number | null;
  description: string | null;
  orderDate: string;
  status: OrderStatus;
  subTotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  currencyUnit: string;
  createdAt: string;
  updatedAt: string;
  user: UserInOrderDto;
  shippingAddress: DatabaseAddressFields;
  orderItems: OrderItemEntity[];
  shipments: ShipmentEntity[];
  payment: PaymentEntity[];
  requests?: RequestInOrderDto[];
}

interface DatabaseAddressFields {
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

export interface ProductVariantForOrderItem {
  id: number;
  productId: number;
  variantName: string;
  variantColor: string;
  variantSize: string;
  price: number;
  currencyUnit: string;
  media: Array<{ id: number; url: string; type: string }>;
}

export interface OrderItemEntity {
  id: number;
  orderId: number;
  productVariantId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountValue: number;
  currencyUnit: string;
  createdAt: string;
  updatedAt: string;
  productVariant: ProductVariantForOrderItem;
}

export interface ShipmentEntity {
  id: number;
  orderId: number;
  processByStaffId: number | null;
  ghnOrderCode: string | null;
  estimatedDelivery: string;
  deliveredAt: string | null;
  estimatedShipDate: string;
  shippedAt: string | null;
  carrier: string;
  trackingNumber: string;
  description: string | null;
  status: ShipmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentEntity {
  id: number;
  orderId: number;
  transactionId: string;
  paymentMethod: string;
  paymentDate: string;
  amount: number;
  currencyUnit: string;
  status: PaymentStatus;
}

// ── Legacy DTOs (kept for backward compat with order list/detail pages) ──

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
}

export interface CreateOrderItemDto {
  orderId: number;
  productVariantId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface UpdateOrderItemDto {
  orderId?: number;
  productVariantId?: number;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
}

// ── Admin order transition DTOs ──

export interface GhnPickShift {
  id: number;
  title: string;
  from_time: number;
  to_time: number;
}

export interface UpdateOrderToWaitingPickupDto {
  processByStaffId: number;
  ghnPickShiftId: number;
  ghnTitle: string;
  ghnFromTime: number;
  ghnToTime: number;
}

export interface UpdateOrderStatusWithStaffDto {
  processByStaffId: number;
}

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
