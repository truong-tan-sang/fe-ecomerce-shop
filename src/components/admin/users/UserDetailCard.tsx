"use client";

import { Loader2, Phone, MapPin } from "lucide-react";
import type { UserDto } from "@/services/user";
import type { OrderFullInformationEntity } from "@/dto/order";

type UserStatus = "ACTIVE" | "INACTIVE" | "VIP";

const STATUS_CONFIG: Record<UserStatus, { label: string; textColor: string; dotClass: string }> = {
  ACTIVE:   { label: "Hoạt động",       textColor: "#21c45d", dotClass: "bg-[#21c45d]" },
  INACTIVE: { label: "Không hoạt động", textColor: "#ef4343", dotClass: "bg-[#ef4343]" },
  VIP:      { label: "VIP",             textColor: "#fbbd23", dotClass: "bg-[#fbbd23]" },
};

function getStatus(user: UserDto): UserStatus {
  if (user.status) return user.status;
  return user.isActive ? "ACTIVE" : "INACTIVE";
}

export function getDisplayName(user: UserDto): string {
  return (
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.name ||
    user.username ||
    "—"
  );
}

const VND = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export interface UserDetailCardProps {
  user: UserDto;
  orders: OrderFullInformationEntity[];
  loading: boolean;
  /** When provided, shown in the address row instead of "Chưa có địa chỉ" */
  addressLine?: string;
}

export function EmptyUserDetailCard() {
  return (
    <div className="bg-white rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.2)] p-5 flex flex-col items-center justify-center gap-3 h-48">
      <p className="text-sm text-gray-400">Chọn một khách hàng để xem chi tiết</p>
    </div>
  );
}

export default function UserDetailCard({ user, orders, loading, addressLine }: UserDetailCardProps) {
  const name   = getDisplayName(user);
  const status = getStatus(user);
  const cfg    = STATUS_CONFIG[status];

  const orderCount     = orders.length;
  const completedCount = orders.filter((o) => o.status === "COMPLETED" || o.status === "DELIVERED").length;
  const cancelledCount = orders.filter((o) => o.status === "CANCELLED").length;
  const totalSpend     = orders.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

  return (
    <div className="bg-white rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.2)] p-5 flex flex-col gap-[10px]">
      <div className="flex items-center gap-3">
        {user.image ? (
          <img src={user.image} alt={name}
            className="w-16 h-16 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[var(--admin-green-mid)] flex items-center justify-center shrink-0">
            <span className="text-[var(--admin-green-dark)] text-xl font-bold">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[18px] font-bold text-[#023337] leading-[26px]">{name}</p>
          <p className="text-[14px] text-[#6a717f] truncate">{user.email}</p>
        </div>
      </div>

      <p className="text-[14px] text-[#9ca3af]">Thông tin khách hàng</p>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1 border border-[#e5e7eb] rounded-[4px] px-2 h-10">
          <Phone size={20} className="text-[#6a717f] shrink-0" />
          <span className="text-[14px] text-[#6a717f]">
            {user.phone || "Chưa có số điện thoại"}
          </span>
        </div>
        <div className="flex items-center gap-1 border border-[#e5e7eb] rounded-[4px] px-2 min-h-10 py-2">
          <MapPin size={20} className="text-[#6a717f] shrink-0" />
          <span className="text-[14px] text-[#6a717f] line-clamp-2">
            {addressLine ?? "Chưa có địa chỉ"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-[14px] text-[#9ca3af]">Tình trạng</p>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${cfg.dotClass}`} />
          <span className="text-[14px] font-medium" style={{ color: cfg.textColor }}>
            {cfg.label}
          </span>
        </div>
      </div>

      <p className="text-[14px] text-[#9ca3af]">Tổng quan mua hàng</p>
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 size={20} className="animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2.5">
            <div className="flex-1 border border-[#d1d5db] rounded-[4px] flex flex-col items-center justify-center px-2 py-[11px] gap-3 overflow-hidden">
              <p className="text-[18px] font-bold text-[#023337] w-full text-center">{orderCount}</p>
              <p className="text-[14px] text-[#6467f2] whitespace-nowrap">Đơn hàng</p>
            </div>
            <div className="flex-1 border border-[#d1d5db] rounded-[4px] flex flex-col items-center justify-center px-2 py-[11px] gap-3 overflow-hidden">
              <p className="text-[18px] font-bold text-[#023337] w-full text-center">{completedCount}</p>
              <p className="text-[14px] text-[#21c45d] whitespace-nowrap">Hoàn thành</p>
            </div>
            <div className="flex-1 border border-[#d1d5db] rounded-[4px] flex flex-col items-center justify-center px-2 py-[11px] gap-3 overflow-hidden">
              <p className="text-[18px] font-bold text-[#023337] w-full text-center">{cancelledCount}</p>
              <p className="text-[14px] text-[#ef4343] whitespace-nowrap">Hủy</p>
            </div>
          </div>
          {orderCount > 0 && (
            <p className="text-[13px] text-[#6a717f] text-right">
              Tổng chi:{" "}
              <span className="font-semibold text-[#023337]">{VND.format(totalSpend)}</span>
            </p>
          )}
        </>
      )}
    </div>
  );
}
