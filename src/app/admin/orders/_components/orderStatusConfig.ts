import {
  Clock,
  CreditCard,
  BadgeCheck,
  PackageSearch,
  Truck,
  PackageCheck,
  PackageX,
  CircleCheck,
  Ban,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import type { OrderStatus } from "@/dto/order";

export const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; icon: LucideIcon }
> = {
  PENDING:            { label: "Chờ xác nhận",   color: "#f59f0a", icon: Clock },
  PAYMENT_PROCESSING: { label: "Đang thanh toán", color: "#f59f0a", icon: CreditCard },
  PAYMENT_CONFIRMED:  { label: "Đã xác nhận",     color: "#0a60f5", icon: BadgeCheck },
  WAITING_FOR_PICKUP: { label: "Chờ lấy hàng",   color: "#f59f0a", icon: PackageSearch },
  SHIPPED:            { label: "Đang giao",        color: "#21c45d", icon: Truck },
  DELIVERED:          { label: "Đã giao",          color: "#111111", icon: PackageCheck },
  DELIVERED_FAILED:   { label: "Giao thất bại",    color: "#ef4343", icon: PackageX },
  COMPLETED:          { label: "Hoàn thành",       color: "#111111", icon: CircleCheck },
  CANCELLED:          { label: "Đã hủy",           color: "#ef4343", icon: Ban },
  RETURNED:           { label: "Hoàn tiền",         color: "#c421a9", icon: RotateCcw },
};

export const STATUS_RANK: Record<OrderStatus, number> = {
  PENDING:            0,
  PAYMENT_PROCESSING: 1,
  PAYMENT_CONFIRMED:  2,
  WAITING_FOR_PICKUP: 3,
  SHIPPED:            4,
  DELIVERED:          5,
  DELIVERED_FAILED:   45, // branch from SHIPPED, not on the main happy-path
  COMPLETED:          6,
  CANCELLED:          -1,
  RETURNED:           -2,
};
