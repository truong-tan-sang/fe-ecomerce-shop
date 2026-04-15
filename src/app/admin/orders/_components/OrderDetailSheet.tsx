"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orderService } from "@/services/order";
import type {
  OrderFullInformationEntity,
  GhnPickShift,
} from "@/dto/order";
import { STATUS_CONFIG, STATUS_RANK } from "./orderStatusConfig";

interface OrderDetailSheetProps {
  order: OrderFullInformationEntity | null;
  open: boolean;
  onClose: () => void;
  onOrderUpdated: (updated: OrderFullInformationEntity) => void;
}

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export default function OrderDetailSheet({
  order,
  open,
  onClose,
  onOrderUpdated,
}: OrderDetailSheetProps) {
  const { data: session } = useSession();
  const accessToken = session?.user?.access_token || "";
  const staffId = session?.user?.id ? Number(session.user.id) : 0;

  const [submitting, setSubmitting] = useState(false);

  // GHN shift state (for Step 1)
  const [ghnShifts, setGhnShifts] = useState<GhnPickShift[]>([]);
  const [selectedShiftId, setSelectedShiftId] = useState<string>("");
  const [loadingShifts, setLoadingShifts] = useState(false);

  const rank = order ? (STATUS_RANK[order.status] ?? -1) : -1;

  const step1State = rank < 2 ? "pending" : rank === 2 ? "active" : "completed";
  const step2State = rank < 3 ? "pending" : "active";
  const step3State = rank < 4 ? "pending" : rank === 4 ? "active" : "completed";

  const fetchGhnShifts = useCallback(async () => {
    if (!accessToken) return;
    setLoadingShifts(true);
    try {
      const res = await orderService.getGhnPickShifts(accessToken);
      const data = Array.isArray(res.data) ? res.data : [];
      setGhnShifts(data);
      if (data.length > 0) setSelectedShiftId(String(data[0].id));
    } catch (err) {
      console.error("[OrderDetailSheet] Failed to fetch GHN shifts:", err);
    } finally {
      setLoadingShifts(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (open && step1State === "active") {
      fetchGhnShifts();
    }
  }, [open, step1State, fetchGhnShifts]);

  if (!order) return null;

  const shipment = order.shipments?.[0];
  const payment = order.payment?.[0];
  const statusCfg = STATUS_CONFIG[order.status];
  const StatusIcon = statusCfg.icon;

  const shippingAddr = order.shippingAddress;
  const addressLine = [
    shippingAddr?.street,
    shippingAddr?.ward,
    shippingAddr?.district,
    shippingAddr?.province,
  ]
    .filter(Boolean)
    .join(", ");

  async function runAction(action: () => Promise<IBackendRes<OrderFullInformationEntity>>) {
    if (!accessToken) return;
    setSubmitting(true);
    try {
      const res = await action();
      if (res.data) {
        onOrderUpdated(res.data);
      } else {
        alert("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("[OrderDetailSheet] Action error:", err);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  const handleConfirmOrder = async () => {
    const shift = ghnShifts.find((s) => String(s.id) === selectedShiftId);
    if (!shift) return alert("Vui lòng chọn ca lấy hàng.");
    await runAction(() =>
      orderService.updateOrderToWaitingPickup(
        order.id,
        {
          processByStaffId: staffId,
          ghnPickShiftId: shift.id,
          ghnTitle: shift.title,
          ghnFromTime: shift.from_time,
          ghnToTime: shift.to_time,
        },
        accessToken
      )
    );
  };

  const handleConfirmDelivered = () =>
    runAction(() =>
      orderService.updateOrderToDelivered(order.id, { processByStaffId: staffId }, accessToken)
    );

  const handleDeliveryFailed = () =>
    runAction(() =>
      orderService.updateOrderToDeliveryFailed(order.id, { processByStaffId: staffId }, accessToken)
    );

  const handleCancel = () => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    runAction(() => orderService.cancelOrder(order.id, accessToken));
  };

  const canCancel = rank >= 0 && rank <= 2;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[90vw] max-w-[90vw] sm:max-w-[90vw] p-0 flex flex-col max-h-[90vh]">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="text-[var(--admin-green-dark)]">
            Chi tiết đơn hàng #{order.id}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* ── Left panel ── */}
          <div className="w-[280px] shrink-0 border-r overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50">
            {/* Status card */}
            <div className="bg-white rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.2)] p-4 flex flex-col gap-3">
              <p className="text-[13px] text-gray-400">Tình trạng</p>
              <div
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: statusCfg.color }}
              >
                <StatusIcon className="w-4 h-4 shrink-0" />
                {statusCfg.label}
              </div>
              {payment?.paymentDate && (
                <p className="text-[13px] text-gray-500">
                  Thanh toán lúc: {formatDate(payment.paymentDate)}
                </p>
              )}
            </div>

            {/* Order info card */}
            <div className="bg-white rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.2)] p-4 flex flex-col gap-3">
              <p className="text-[13px] text-gray-400">Thông tin đơn hàng</p>
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-400">Khách hàng</span>
                  <span className="font-medium text-[var(--admin-green-dark)]">#{order.userId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ngày đặt</span>
                  <span>{formatDate(order.orderDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Thanh toán</span>
                  <span>{payment?.paymentMethod ?? "—"}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-1">
                  <span className="text-gray-400">Tổng tiền</span>
                  <span className="font-bold text-[var(--admin-green-dark)]">
                    {order.totalAmount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            </div>

            {/* Address card */}
            {addressLine && (
              <div className="bg-white rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.2)] p-4 flex flex-col gap-2">
                <p className="text-[13px] text-gray-400">Địa chỉ giao hàng</p>
                <p className="text-sm text-gray-600 leading-snug">{addressLine}</p>
              </div>
            )}
          </div>

          {/* ── Right panel ── */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            {/* Product items */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Sản phẩm
              </p>
              {order.orderItems.length === 0 ? (
                <div className="flex items-center gap-3 text-gray-400 text-sm border rounded-lg p-4">
                  <Package className="w-5 h-5" />
                  Không có sản phẩm
                </div>
              ) : (
                order.orderItems.map((item) => {
                  const thumb = item.productVariant?.media?.[0]?.url;
                  return (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 flex gap-4 items-start"
                    >
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={item.productVariant.variantName}
                          className="w-20 h-20 rounded-lg object-cover border shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[var(--admin-green-dark)] text-base">
                          {item.productVariant?.variantName ?? "—"}
                        </p>
                        <p className="font-bold text-gray-800 mt-0.5">
                          {item.unitPrice.toLocaleString("vi-VN")}đ
                        </p>
                        <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-x-4">
                          <span>Size: {item.productVariant?.variantSize ?? "—"}</span>
                          <span>Màu: {item.productVariant?.variantColor ?? "—"}</span>
                          <span>SL: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400 whitespace-nowrap">
                        {item.totalPrice.toLocaleString("vi-VN")}đ
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t" />

            {/* ── Step 1 ── */}
            <div className="flex flex-col gap-3">
              <p
                className={`font-bold text-base ${
                  step1State === "pending" ? "text-gray-300" : "text-black"
                }`}
              >
                Bước 1: Xác nhận đơn hàng
              </p>

              {step1State === "active" && (
                <div className="border rounded-lg p-4 flex flex-col gap-3 bg-gray-50">
                  <p className="text-sm text-gray-600">Chọn ca lấy hàng GHN:</p>
                  {loadingShifts ? (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang tải ca lấy...
                    </div>
                  ) : (
                    <Select
                      value={selectedShiftId}
                      onValueChange={setSelectedShiftId}
                    >
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Chọn ca lấy hàng" />
                      </SelectTrigger>
                      <SelectContent>
                        {ghnShifts.map((s) => (
                          <SelectItem
                            key={s.id}
                            value={String(s.id)}
                            className="cursor-pointer"
                          >
                            {s.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Button
                    onClick={handleConfirmOrder}
                    disabled={submitting || loadingShifts || !selectedShiftId}
                    className="w-fit cursor-pointer"
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" />Đang xử lý...</>
                    ) : (
                      "Xác nhận"
                    )}
                  </Button>
                </div>
              )}

              {step1State === "completed" && (
                <div className="border rounded-lg px-4 py-2 w-fit">
                  <p className="text-sm text-gray-400">Đã xác nhận</p>
                </div>
              )}

              {step1State === "pending" && (
                <div className="border rounded-lg px-4 py-2 w-fit bg-gray-50 border-gray-200">
                  <p className="text-sm text-gray-300">Xác nhận</p>
                </div>
              )}
            </div>

            {/* ── Step 2 ── */}
            <div className="flex flex-col gap-3">
              <p
                className={`font-bold text-base ${
                  step2State === "pending" ? "text-gray-300" : "text-black"
                }`}
              >
                Bước 2: Chuyển cho đơn vị vận chuyển
              </p>

              {step2State === "active" && shipment && (
                <div className="border rounded-lg p-4 flex flex-col gap-3 bg-gray-50">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500 w-28 shrink-0">Mã vận đơn:</span>
                    <span className="font-mono font-bold text-[var(--admin-green-dark)]">
                      {shipment.ghnOrderCode ?? shipment.trackingNumber ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500 w-28 shrink-0">ĐVVC:</span>
                    <span className="font-bold">{shipment.carrier ?? "—"}</span>
                  </div>

                  {/* Shipment timeline */}
                  <div className="mt-2 flex flex-col gap-2">
                    {[
                      { label: "Ngày lấy dự kiến", date: shipment.estimatedShipDate },
                      { label: "Đã lấy hàng", date: shipment.shippedAt },
                      { label: "Ngày giao dự kiến", date: shipment.estimatedDelivery },
                      { label: "Đã giao hàng", date: shipment.deliveredAt },
                    ]
                      .filter((e) => e.date)
                      .map((e) => (
                        <div key={e.label} className="flex items-start gap-3 text-sm">
                          <div className="w-2 h-2 rounded-full bg-[var(--admin-green-dark)] mt-1.5 shrink-0" />
                          <div>
                            <p className="text-gray-400 text-xs">{e.label}</p>
                            <p className="text-gray-700">{formatDate(e.date)}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {step2State === "pending" && (
                <div className="border rounded-lg px-4 py-2 w-fit bg-gray-50 border-gray-200">
                  <p className="text-sm text-gray-300">Chờ xác nhận bước 1</p>
                </div>
              )}
            </div>

            {/* ── Step 3 ── */}
            <div className="flex flex-col gap-3">
              <p
                className={`font-bold text-base ${
                  step3State === "pending" ? "text-gray-300" : "text-black"
                }`}
              >
                Bước 3: Xác nhận hoàn tất đơn hàng
              </p>

              {step3State === "active" && (
                <div className="flex gap-3">
                  <Button
                    onClick={handleConfirmDelivered}
                    disabled={submitting}
                    className="cursor-pointer"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Xác nhận hoàn thành"}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeliveryFailed}
                    disabled={submitting}
                    className="cursor-pointer"
                  >
                    Giao thất bại
                  </Button>
                </div>
              )}

              {step3State === "completed" && (
                <div className="border rounded-lg px-4 py-2 w-fit">
                  <p className="text-sm text-gray-400">Đã hoàn thành</p>
                </div>
              )}

              {step3State === "pending" && (
                <div className="border rounded-lg px-4 py-2 w-fit bg-gray-50 border-gray-200">
                  <p className="text-sm text-gray-300">Xác nhận hoàn thành</p>
                </div>
              )}
            </div>

            {/* ── Cancel ── */}
            {canCancel && (
              <>
                <div className="border-t" />
                <div>
                  <Button
                    variant="destructive"
                    onClick={handleCancel}
                    disabled={submitting}
                    className="cursor-pointer"
                  >
                    Hủy đơn hàng
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
