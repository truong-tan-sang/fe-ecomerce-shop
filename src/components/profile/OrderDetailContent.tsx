"use client";

import React from "react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { orderService } from "@/services/order";
import { shipmentService } from "@/services/shipment";
import type { OrderFullInformationEntity, OrderStatus } from "@/dto/order";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { returnRequestService } from "@/services/returnRequest";
import { VIETNAM_BANK_OPTIONS, type VietnamBankName } from "@/dto/returnRequest";
import BuyAgainButton from "@/components/profile/BuyAgainButton";

const VND = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING:            "CHỜ XÁC NHẬN",
  PAYMENT_PROCESSING: "ĐANG XỬ LÝ THANH TOÁN",
  PAYMENT_CONFIRMED:  "ĐANG CHUẨN BỊ HÀNG",
  WAITING_FOR_PICKUP: "CHỜ SHIPPER ĐẾN LẤY HÀNG",
  SHIPPED:            "ĐANG VẬN CHUYỂN",
  DELIVERED:          "ĐÃ GIAO HÀNG",
  DELIVERED_FAILED:   "GIAO HÀNG THẤT BẠI",
  COMPLETED:          "HOÀN THÀNH",
  CANCELLED:          "ĐÃ HUỶ",
  RETURNED:           "ĐÃ TRẢ HÀNG",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING:            "text-orange-600",
  PAYMENT_PROCESSING: "text-amber-600",
  PAYMENT_CONFIRMED:  "text-blue-600",
  WAITING_FOR_PICKUP: "text-blue-600",
  SHIPPED:            "text-blue-600",
  DELIVERED:          "text-green-600",
  DELIVERED_FAILED:   "text-red-500",
  COMPLETED:          "text-green-700",
  CANCELLED:          "text-red-600",
  RETURNED:           "text-red-600",
};

// ── Stepper ────────────────────────────────────────────────────────────────

const COD_STEPS: OrderStatus[] = [
  "PENDING",
  "PAYMENT_CONFIRMED",
  "WAITING_FOR_PICKUP",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
];

const VNPAY_STEPS: OrderStatus[] = [
  "PENDING",
  "PAYMENT_PROCESSING",
  "PAYMENT_CONFIRMED",
  "WAITING_FOR_PICKUP",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
];

const STEP_LABEL: Partial<Record<OrderStatus, string>> = {
  PENDING:            "Đặt hàng",
  PAYMENT_PROCESSING: "Đang xử lý thanh toán",
  PAYMENT_CONFIRMED:  "Đang chuẩn bị hàng",
  WAITING_FOR_PICKUP: "Chờ shipper lấy hàng",
  SHIPPED:            "Đang vận chuyển",
  DELIVERED:          "Đã giao hàng",
  COMPLETED:          "Hoàn thành",
};

function getStepTimestamp(
  step: OrderStatus,
  order: OrderFullInformationEntity
): string | null {
  const shipment = order.shipments?.[0];
  const payment = order.payment?.[0];
  const fmt = (d: string | null | undefined) =>
    d ? new Date(d).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }) : null;

  switch (step) {
    case "PENDING":            return fmt(order.orderDate);
    case "PAYMENT_PROCESSING": return fmt(payment?.paymentDate);
    case "PAYMENT_CONFIRMED":  return fmt(payment?.paymentDate ?? order.orderDate);
    case "WAITING_FOR_PICKUP": return fmt(shipment?.createdAt);
    case "SHIPPED":            return fmt(shipment?.shippedAt);
    case "DELIVERED":          return fmt(shipment?.deliveredAt);
    case "COMPLETED":          return fmt(order.updatedAt);
    default:                   return null;
  }
}

type StepState = "done" | "active" | "pending";

function getStepState(
  step: OrderStatus,
  currentStatus: OrderStatus,
  steps: OrderStatus[]
): StepState {
  const terminalDone = new Set<OrderStatus>(["CANCELLED", "RETURNED", "DELIVERED_FAILED"]);
  const stepIdx = steps.indexOf(step);
  const currentIdx = steps.indexOf(currentStatus);

  // For terminal statuses not in the steps list, treat everything as done
  if (terminalDone.has(currentStatus)) return "done";
  if (currentIdx === -1) return "done";
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

const STEP_ICONS: Record<string, (color: string) => React.ReactNode> = {
  PENDING: (c) => (
    // Shopping bag — order placed
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  ),
  PAYMENT_PROCESSING: (c) => (
    // Clock — awaiting payment
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  PAYMENT_CONFIRMED: (c) => (
    // Box — seller preparing package
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8"/>
      <rect x="1" y="3" width="22" height="5"/>
      <line x1="10" y1="12" x2="14" y2="12"/>
    </svg>
  ),
  WAITING_FOR_PICKUP: (c) => (
    // Warehouse / store — waiting for carrier pickup
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  SHIPPED: (c) => (
    // Truck — in transit
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13"/>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  DELIVERED: (c) => (
    // Map pin / house — delivered to customer
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  COMPLETED: (c) => (
    // Star — order complete / review
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
};

function StepIcon({ state, step }: { state: StepState; step: string }) {
  const iconFn = STEP_ICONS[step];

  if (state === "done") {
    return (
      <div className="w-10 h-10 bg-[var(--accent-primary)] flex items-center justify-center">
        {iconFn ? iconFn("white") : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    );
  }
  if (state === "active") {
    return (
      <div className="w-10 h-10 border-2 border-[var(--border-primary)] bg-white flex items-center justify-center">
        {iconFn ? iconFn("black") : <div className="w-3 h-3 bg-[var(--accent-primary)]" />}
      </div>
    );
  }
  return (
    <div className="w-10 h-10 border-2 border-gray-300 bg-white flex items-center justify-center">
      {iconFn ? iconFn("#d1d5db") : <div className="w-3 h-3 bg-gray-300" />}
    </div>
  );
}

function Stepper({ order, onCancelled }: { order: OrderFullInformationEntity; onCancelled: () => void }) {
  const isCOD = order.payment?.[0]?.paymentMethod === "COD";
  const steps = isCOD ? COD_STEPS : VNPAY_STEPS;

  const terminalStatus = new Set<OrderStatus>(["CANCELLED", "DELIVERED_FAILED", "RETURNED"]);
  const isTerminal = terminalStatus.has(order.status);

  if (isTerminal) {
    return (
      <div className="flex items-center gap-3 py-4 px-6 bg-gray-50 border">
        <div className="w-8 h-8 bg-red-600 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2L12 12M12 2L2 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <span className={`font-semibold text-sm ${STATUS_COLOR[order.status]}`}>
          {STATUS_LABEL[order.status]}
        </span>
        {order.orderDate && (
          <span className="text-xs text-gray-500 ml-2">
            {new Date(order.orderDate).toLocaleString("vi-VN", {
              hour: "2-digit", minute: "2-digit",
              day: "2-digit", month: "2-digit", year: "numeric",
            })}
          </span>
        )}
      </div>
    );
  }

  const cancellable = new Set<OrderStatus>(["PENDING", "PAYMENT_PROCESSING", "PAYMENT_CONFIRMED"]);

  return (
    <div className="px-6 py-6 overflow-x-auto">
      <div className="flex items-center gap-6 min-w-max">
        <div className="flex items-start">
        {steps.map((step, idx) => {
          const state = getStepState(step, order.status, steps);
          const timestamp = state !== "pending" ? getStepTimestamp(step, order) : null;
          const isLast = idx === steps.length - 1;

          return (
            <div key={step} className="flex items-start">
              {/* Step node */}
              <div className="flex flex-col items-center w-28">
                <StepIcon state={state} step={step} />
                <p className={`text-xs mt-2 text-center leading-tight font-medium ${state === "pending" ? "text-gray-400" : "text-black"}`}>
                  {STEP_LABEL[step]}
                </p>
                {timestamp && (
                  <p className="text-xs text-gray-500 mt-1 text-center">{timestamp}</p>
                )}
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="w-12 h-0.5 mt-4 flex-shrink-0">
                  <div className={`w-full h-full ${state === "done" ? "bg-[var(--accent-primary)]" : "bg-gray-200"}`} />
                </div>
              )}
            </div>
          );
        })}
        </div>

        {cancellable.has(order.status) && (
          <CancelButton order={order} onCancelled={onCancelled} />
        )}
      </div>
    </div>
  );
}

// ── Cancel button (used inside Stepper) ───────────────────────────────────

function CancelButton({ order, onCancelled }: { order: OrderFullInformationEntity; onCancelled: () => void }) {
  const [cancelling, setCancelling] = useState(false);
  const [showRefundNotice, setShowRefundNotice] = useState(false);
  const { data: session } = useSession();

  const isVnpay = order.payment?.some(
    (p) => p.paymentMethod === "VNPAY" && (p.status === "PAID" || p.status === "PENDING")
  );
  console.log("[CancelButton] payment:", order.payment, "isVnpay:", isVnpay);

  const handleCancel = async () => {
    if (!session?.user?.access_token) return;
    setCancelling(true);
    try {
      await orderService.cancelOrder(order.id, session.user.access_token);
      console.log("[CancelButton] cancel succeeded, isVnpay:", isVnpay, "payment:", JSON.stringify(order.payment));

      if (isVnpay) {
        // Show refund notice dialog instead of navigating immediately
        setShowRefundNotice(true);
      } else {
        toast.success("Đã huỷ đơn hàng");
        onCancelled();
      }
    } catch {
      toast.error("Huỷ đơn thất bại. Vui lòng thử lại.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        disabled={cancelling}
        onClick={handleCancel}
        className="border-red-500 text-red-600 font-semibold hover:bg-red-50 hover:text-red-600 cursor-pointer flex-shrink-0"
      >
        {cancelling ? "Đang huỷ..." : "Huỷ đơn"}
      </Button>

      <Dialog open={showRefundNotice} onOpenChange={setShowRefundNotice}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thông báo hoàn tiền</DialogTitle>
            <DialogDescription>
              Yêu cầu hoàn tiền của quý khách đã được chuyển đến VNPay và đang
              được xử lý. Số tiền sẽ được hoàn lại trong vòng 5–7 ngày làm việc.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="bg-[var(--bg-button)] text-[var(--text-inverse)] hover:bg-[var(--bg-button-hover)] cursor-pointer"
              onClick={() => {
                setShowRefundNotice(false);
                onCancelled();
              }}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Return request dialog ──────────────────────────────────────────────────

function ReturnRequestDialog({
  order,
  open,
  onClose,
}: {
  order: OrderFullInformationEntity;
  open: boolean;
  onClose: () => void;
}) {
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [description, setDescription] = useState("");
  const [bankName, setBankName] = useState<VietnamBankName | "">("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");

  const handleSubmit = async () => {
    if (!session?.user?.access_token) return;
    if (!description.trim()) { toast.error("Vui lòng nhập lý do trả hàng."); return; }
    if (!bankName) { toast.error("Vui lòng chọn ngân hàng."); return; }
    if (!bankAccountNumber.trim()) { toast.error("Vui lòng nhập số tài khoản."); return; }
    if (!bankAccountName.trim()) { toast.error("Vui lòng nhập tên chủ tài khoản."); return; }

    setSubmitting(true);
    try {
      await returnRequestService.create(
        {
          userId: order.userId,
          orderId: order.id,
          description: description.trim(),
          bankName: bankName as VietnamBankName,
          bankAccountNumber: bankAccountNumber.trim(),
          bankAccountName: bankAccountName.trim(),
        },
        session.user.access_token
      );
      toast.success("Yêu cầu hoàn trả đã được gửi. Chúng tôi sẽ liên hệ trong thời gian sớm nhất.");
      onClose();
    } catch {
      toast.error("Gửi yêu cầu thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Yêu cầu trả hàng / hoàn tiền</DialogTitle>
          <DialogDescription>
            Đơn hàng #{order.id}. Vui lòng cung cấp lý do và thông tin tài khoản để nhận hoàn tiền.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rr-desc">Lý do trả hàng <span className="text-red-500">*</span></Label>
            <Textarea
              id="rr-desc"
              placeholder="Mô tả lý do bạn muốn trả hàng..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rr-bank">Ngân hàng <span className="text-red-500">*</span></Label>
            <Select value={bankName} onValueChange={(v) => setBankName(v as VietnamBankName)}>
              <SelectTrigger id="rr-bank" className="cursor-pointer">
                <SelectValue placeholder="Chọn ngân hàng" />
              </SelectTrigger>
              <SelectContent>
                {VIETNAM_BANK_OPTIONS.map((b) => (
                  <SelectItem key={b.value} value={b.value} className="cursor-pointer">
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rr-acc-num">Số tài khoản <span className="text-red-500">*</span></Label>
            <Input
              id="rr-acc-num"
              placeholder="VD: 0123456789"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rr-acc-name">Tên chủ tài khoản <span className="text-red-500">*</span></Label>
            <Input
              id="rr-acc-name"
              placeholder="VD: NGUYEN VAN A"
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting} className="cursor-pointer">
            Huỷ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[var(--bg-button)] text-[var(--text-inverse)] hover:bg-[var(--bg-button-hover)] cursor-pointer"
          >
            {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Action buttons ─────────────────────────────────────────────────────────

function OrderActions({
  order,
  onCancelled,
}: {
  order: OrderFullInformationEntity;
  onCancelled: () => void;
}) {
  const [showReturnDialog, setShowReturnDialog] = useState(false);

  if (order.status === "DELIVERED") {
    const shipment = order.shipments?.[0];
    const deliveredAt = shipment?.deliveredAt ? new Date(shipment.deliveredAt) : null;
    const withinReturnWindow = deliveredAt
      ? Date.now() - deliveredAt.getTime() < 7 * 24 * 60 * 60 * 1000
      : false;

    return (
      <>
        <div className="flex gap-2">
          {withinReturnWindow && (
            <Button
              variant="outline"
              className="border-gray-300 cursor-pointer"
              onClick={() => setShowReturnDialog(true)}
            >
              Yêu cầu trả hàng / hoàn tiền
            </Button>
          )}
          <BuyAgainButton orderItems={order.orderItems ?? []} />
        </div>
        <ReturnRequestDialog
          order={order}
          open={showReturnDialog}
          onClose={() => setShowReturnDialog(false)}
        />
      </>
    );
  }

  if (order.status === "COMPLETED") {
    return (
      <div className="flex gap-2">
        <Button variant="outline" className="border-[var(--border-primary)] font-semibold cursor-pointer">
          Đánh giá
        </Button>
        <BuyAgainButton orderItems={order.orderItems ?? []} />
      </div>
    );
  }

  if (order.status === "CANCELLED" || order.status === "RETURNED") {
    return <BuyAgainButton orderItems={order.orderItems ?? []} />;
  }

  return null;
}

// ── Main component ─────────────────────────────────────────────────────────

function GHNTrackingButton({ orderId }: { orderId: number }) {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const handleTrack = async () => {
    if (!session?.user?.access_token) return;
    setLoading(true);
    try {
      const response = await shipmentService.getGHNTrackingUrl(orderId, session.user.access_token);
      const url = response.data;
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        toast.error("Không tìm thấy link tra cứu vận chuyển.");
      }
    } catch {
      toast.error("Không thể lấy link tra cứu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleTrack}
      disabled={loading}
      className="mt-1 flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer disabled:opacity-50"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
        <polyline points="15 3 21 3 21 9"/>
        <line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
      {loading ? "Đang tải..." : "Tra cứu vận chuyển trên GHN"}
    </button>
  );
}

export default function OrderDetailContent({ orderId }: { orderId: number }) {
  const [order, setOrder] = useState<OrderFullInformationEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  const loadOrder = async () => {
    if (!session?.user?.access_token) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await orderService.getOrderDetail(orderId, session.user.access_token);
      setOrder(response.data ?? null);
    } catch {
      toast.error("Không thể tải thông tin đơn hàng.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, orderId]);

  if (isLoading) {
    return <div className="py-12 text-center text-gray-500">Đang tải...</div>;
  }

  if (!order) {
    return <div className="py-12 text-center text-gray-500">Không tìm thấy đơn hàng.</div>;
  }

  const payment = order.payment?.[0];
  const shipment = order.shipments?.[0];
  const addr = order.shippingAddress;

  const paymentMethodLabel: Record<string, string> = {
    COD:   "Thanh toán khi nhận hàng (COD)",
    VNPAY: "VNPay",
  };

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b pb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black cursor-pointer"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M7 1L3 5L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          TRỞ LẠI
        </button>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-500">MÃ ĐƠN HÀNG: <span className="font-semibold text-black">#{order.id}</span></span>
          <span className="text-gray-300">|</span>
          <span className={`font-semibold ${STATUS_COLOR[order.status]}`}>
            {STATUS_LABEL[order.status]}
          </span>
        </div>
      </div>

      {/* ── Stepper (cancel button lives inside when applicable) ── */}
      <div className="border bg-white">
        <Stepper order={order} onCancelled={loadOrder} />
      </div>

      {/* ── Non-cancel actions (delivered, completed, etc.) ── */}
      {order.status !== "SHIPPED" && order.status !== "WAITING_FOR_PICKUP" && order.status !== "DELIVERED_FAILED" && order.status !== "PENDING" && order.status !== "PAYMENT_PROCESSING" && order.status !== "PAYMENT_CONFIRMED" && (
        <div className="border bg-white px-6 py-4 flex justify-end">
          <OrderActions order={order} onCancelled={loadOrder} />
        </div>
      )}

      {/* ── Shipping address + shipment info ── */}
      <div className="border bg-white">
        <div className="px-6 py-4 border-b">
          <h2 className="text-sm font-semibold uppercase tracking-wide">Địa chỉ nhận hàng</h2>
        </div>
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Address */}
          <div className="space-y-1 text-sm">
            {addr && (
              <p className="text-gray-700">
                {[addr.street, addr.ward, addr.district, addr.province]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
            {order.description && (
              <p className="text-gray-500 italic">Ghi chú: {order.description}</p>
            )}
          </div>

          {/* Shipment */}
          {shipment && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Đơn vị vận chuyển:</span>
                <span className="font-medium">{shipment.carrier}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Mã vận đơn:</span>
                <span className="font-mono font-medium">{shipment.trackingNumber}</span>
              </div>
              {shipment.ghnOrderCode && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Mã GHN:</span>
                  <span className="font-mono">{shipment.ghnOrderCode}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Dự kiến giao:</span>
                <span>{new Date(shipment.estimatedShipDate).toLocaleDateString("vi-VN")}</span>
              </div>
              {shipment.deliveredAt && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Giao thực tế:</span>
                  <span className="text-green-600 font-medium">
                    {new Date(shipment.deliveredAt).toLocaleString("vi-VN")}
                  </span>
                </div>
              )}
              {shipment.ghnOrderCode && (
                <GHNTrackingButton orderId={order.id} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Order items ── */}
      <div className="border bg-white">
        <div className="px-6 py-4 border-b">
          <h2 className="text-sm font-semibold uppercase tracking-wide">Sản phẩm</h2>
        </div>
        <div className="divide-y">
          {order.orderItems.map((item) => {
            const imageUrl = item.productVariant?.media?.[0]?.url;
            return (
              <div key={item.id} className="px-6 py-4 flex items-center gap-4">
                <div className="w-16 h-16 border bg-gray-50 flex-shrink-0 overflow-hidden">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.productVariant.variantName}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <i className="fa-solid fa-image text-xl" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black">
                    {item.productVariant?.variantName ?? `Variant #${item.productVariantId}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.productVariant?.variantColor && <span>Màu: {item.productVariant.variantColor}</span>}
                    {item.productVariant?.variantSize && <span className="ml-2">Size: {item.productVariant.variantSize}</span>}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{VND.format(item.unitPrice)} × {item.quantity}</p>
                </div>
                <div className="text-sm text-right flex-shrink-0 space-y-0.5">
                  {item.discountValue > 0 && (
                    <p className="text-xs text-gray-400 line-through">
                      {VND.format(item.unitPrice * item.quantity)}
                    </p>
                  )}
                  <p className="font-semibold text-black">{VND.format(item.totalPrice)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Pricing + Payment ── */}
      <div className="border bg-white">
        <div className="px-6 py-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Tổng tiền hàng</span>
            <span>{VND.format(order.subTotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Phí vận chuyển</span>
            <span>{VND.format(order.shippingFee)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Giảm giá</span>
              <span>-{VND.format(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base pt-2 border-t">
            <span>Thành tiền</span>
            <span className="text-red-600">{VND.format(order.totalAmount)}</span>
          </div>
          {payment && (
            <div className="flex justify-between text-gray-600 pt-2 border-t">
              <span>Phương thức thanh toán</span>
              <span>{paymentMethodLabel[payment.paymentMethod] ?? payment.paymentMethod}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
