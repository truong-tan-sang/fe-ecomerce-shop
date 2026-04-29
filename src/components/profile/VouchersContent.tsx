"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { voucherService } from "@/services/voucher";
import type { UserVoucherDto, VoucherDto } from "@/dto/voucher";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

type UserVoucherStatus = "active" | "upcoming" | "used" | "expired";
type TabValue = "all" | "active" | "used" | "expired";

function getVoucherStatus(uv: UserVoucherDto): UserVoucherStatus {
  if (uv.voucherStatus === "USED") return "used";
  const now = dayjs();
  const validTo = dayjs(uv.voucher.validTo);
  const validFrom = dayjs(uv.voucher.validFrom);
  if (uv.voucherStatus === "EXPIRED" || validTo.isBefore(now)) return "expired";
  if (validFrom.isAfter(now)) return "upcoming";
  return "active";
}

function discountLabel(v: VoucherDto): string {
  if (v.discountType === "PERCENTAGE") return `${v.discountValue}%`;
  return `${v.discountValue.toLocaleString("vi-VN")}đ`;
}

function scopeLabel(v: VoucherDto): string {
  if (v.voucherForSpecialProductVariant?.length > 0) return "Biến thể cụ thể";
  if (v.voucherForProduct?.length > 0)
    return `Sản phẩm: ${v.voucherForProduct.map((p) => p.name).join(", ")}`;
  if (v.voucherForCategory?.length > 0)
    return `Danh mục: ${v.voucherForCategory.map((c) => c.name).join(", ")}`;
  return "Áp dụng cho toàn bộ đơn hàng";
}

const STATUS_CONFIG: Record<UserVoucherStatus, { label: string; className: string }> = {
  active:   { label: "Còn hiệu lực",  className: "bg-green-100 text-green-700" },
  upcoming: { label: "Sắp diễn ra",   className: "bg-blue-100 text-blue-700" },
  used:     { label: "Đã sử dụng",    className: "bg-gray-100 text-gray-600" },
  expired:  { label: "Đã hết hạn",    className: "bg-gray-100 text-gray-600" },
};

const TABS: { value: TabValue; label: string }[] = [
  { value: "all",     label: "Tất cả" },
  { value: "active",  label: "Còn hiệu lực" },
  { value: "used",    label: "Đã sử dụng" },
  { value: "expired", label: "Đã hết hạn" },
];

function VoucherCard({
  code,
  discount,
  description,
  validFrom,
  validTo,
  dimmed,
  statusBadge,
  scopeText,
  onUseNow,
  onCopy,
  copied,
}: {
  code: string;
  discount: string;
  description?: string | null;
  validFrom: string;
  validTo: string;
  dimmed?: boolean;
  statusBadge?: { label: string; className: string };
  scopeText?: string;
  onUseNow?: () => void;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className={`border bg-white overflow-hidden ${dimmed ? "opacity-50" : ""}`}>
      <div className="bg-black text-white p-4 text-center">
        <div className="text-3xl font-bold mb-1">{discount}</div>
        <div className="text-xs uppercase tracking-wider">Giảm giá</div>
      </div>
      <div className="p-4">
        {description && (
          <p className="text-xs text-gray-600 mb-3">{description}</p>
        )}
        {scopeText && (
          <p className="text-xs text-gray-500 mb-3 italic">{scopeText}</p>
        )}
        <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 border border-dashed">
          <span className="flex-1 text-xs font-mono font-semibold">{code}</span>
          <button
            onClick={onCopy}
            className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer transition-colors font-medium"
          >
            {copied ? "Đã sao chép!" : "Sao chép"}
          </button>
        </div>
        <div className="text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1 mb-1">
            <i className="fa-regular fa-calendar w-4" />
            <span>Từ {dayjs(validFrom).format("DD/MM/YYYY")}</span>
          </div>
          <div className="flex items-center gap-1">
            <i className="fa-regular fa-calendar w-4" />
            <span>Đến {dayjs(validTo).format("DD/MM/YYYY")}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          {statusBadge && (
            <span className={`text-xs font-semibold px-2 py-1 ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
          )}
          {onUseNow && (
            <Button
              variant="link"
              onClick={onUseNow}
              className="text-xs text-blue-600 font-semibold h-auto p-0 cursor-pointer ml-auto"
            >
              Dùng ngay
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VouchersContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const accessToken = (session?.user as { access_token?: string })?.access_token;

  const [userVouchers, setUserVouchers] = useState<UserVoucherDto[]>([]);
  const [shopVouchers, setShopVouchers] = useState<VoucherDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = useCallback((code: string, id: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [uvRes, svRes] = await Promise.all([
          accessToken ? voucherService.getMyVouchers(accessToken) : Promise.resolve(null),
          voucherService.searchVouchers({ isActive: true }, 1, 100),
        ]);
        if (cancelled) return;
        setUserVouchers(Array.isArray(uvRes?.data) ? uvRes.data : []);
        setShopVouchers(Array.isArray(svRes?.data) ? svRes.data : []);
      } catch (err) {
        console.error("[VouchersContent] Failed to load vouchers:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [accessToken]);

  const filteredUserVouchers = userVouchers.filter((uv) => {
    if (activeTab === "all") return true;
    const s = getVoucherStatus(uv);
    if (activeTab === "active") return s === "active" || s === "upcoming";
    if (activeTab === "used") return s === "used";
    if (activeTab === "expired") return s === "expired";
    return true;
  });

  return (
    <>
      <h1 className="text-2xl font-bold mb-8">Voucher của bạn</h1>

      {/* ── Section 1: user's saved vouchers ─────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Voucher của tôi</h2>

        {/* Filter tabs */}
        <div className="flex items-center gap-4 mb-6 border-b">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`pb-2 px-0 text-sm transition-colors cursor-pointer border-b-2 ${
                activeTab === tab.value
                  ? "font-bold text-black border-black"
                  : "text-gray-600 hover:text-black border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-gray-500">Đang tải...</div>
        ) : filteredUserVouchers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <i className="fa-solid fa-ticket text-4xl mb-4 block" />
            <p>Chưa có voucher nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredUserVouchers.map((uv) => {
              const status = getVoucherStatus(uv);
              return (
                <VoucherCard
                  key={uv.id}
                  code={uv.voucher.code}
                  discount={discountLabel(uv.voucher)}
                  description={uv.voucher.description}
                  validFrom={uv.voucher.validFrom}
                  validTo={uv.voucher.validTo}
                  dimmed={status === "expired" || status === "used"}
                  statusBadge={STATUS_CONFIG[status]}
                  onUseNow={status === "active" ? () => router.push("/search") : undefined}
                  onCopy={() => handleCopy(uv.voucher.code, `uv-${uv.id}`)}
                  copied={copiedId === `uv-${uv.id}`}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* ── Section 2: shop vouchers ──────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Voucher cửa hàng</h2>
        <p className="text-xs text-gray-500 mb-6">
          Tự động áp dụng khi thanh toán theo mức độ ưu tiên: biến thể → sản phẩm → danh mục
        </p>

        {loading ? (
          <div className="py-8 text-center text-sm text-gray-500">Đang tải...</div>
        ) : shopVouchers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <i className="fa-solid fa-tag text-4xl mb-4 block" />
            <p>Hiện chưa có voucher cửa hàng nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {shopVouchers.map((v) => (
              <VoucherCard
                key={v.id}
                code={v.code}
                discount={discountLabel(v)}
                description={v.description}
                validFrom={v.validFrom}
                validTo={v.validTo}
                scopeText={scopeLabel(v)}
                onCopy={() => handleCopy(v.code, `sv-${v.id}`)}
                copied={copiedId === `sv-${v.id}`}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
