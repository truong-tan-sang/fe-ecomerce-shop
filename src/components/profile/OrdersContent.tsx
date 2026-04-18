"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { orderService } from "@/services/order";
import type { OrderFullInformationEntity, OrderStatus } from "@/dto/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import BuyAgainButton from "@/components/profile/BuyAgainButton";

const PER_PAGE = 10; // backend default page size

const VND = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

type TabKey = "all" | "confirmed" | "shipped" | "delivered" | "completed" | "cancelled" | "returned";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all",       label: "Tất cả" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "shipped",   label: "Đang vận chuyển" },
  { key: "delivered", label: "Đã giao" },
  { key: "completed", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã huỷ" },
  { key: "returned",  label: "Trả hàng" },
];

const STATUS_CONFIG: Record<OrderStatus, { text: string; color: string }> = {
  PENDING:             { text: "CHỜ XÁC NHẬN",              color: "text-orange-600" },
  PAYMENT_PROCESSING:  { text: "ĐANG XỬ LÝ THANH TOÁN",     color: "text-amber-600" },
  PAYMENT_CONFIRMED:   { text: "ĐANG CHUẨN BỊ HÀNG",        color: "text-blue-600" },
  WAITING_FOR_PICKUP:  { text: "CHỜ SHIPPER ĐẾN LẤY HÀNG",  color: "text-blue-600" },
  SHIPPED:             { text: "ĐANG VẬN CHUYỂN",            color: "text-blue-600" },
  DELIVERED:           { text: "ĐÃ GIAO HÀNG",               color: "text-green-600" },
  DELIVERED_FAILED:    { text: "GIAO HÀNG THẤT BẠI",         color: "text-red-500" },
  COMPLETED:           { text: "HOÀN THÀNH",                 color: "text-green-700" },
  CANCELLED:           { text: "ĐÃ HUỶ",                    color: "text-red-600" },
  RETURNED:            { text: "ĐÃ TRẢ HÀNG",                color: "text-red-600" },
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  COD:   "Thanh toán khi nhận hàng",
  VNPAY: "VNPay",
};


function OrderActions({
  status,
  orderId,
  orderItems,
  onCancelled,
}: {
  status: OrderStatus;
  orderId: number;
  orderItems: { productVariantId: number }[];
  onCancelled: (orderId: number) => void;
}) {
  const [cancelling, setCancelling] = useState(false);
  const { data: session } = useSession();

  // Only cancellable before WAITING_FOR_PICKUP — backend enforces this too
  const cancellable = new Set<OrderStatus>([
    "PENDING", "PAYMENT_PROCESSING", "PAYMENT_CONFIRMED",
  ]);

  const handleCancel = async () => {
    if (!session?.user?.access_token) return;
    setCancelling(true);
    try {
      await orderService.cancelOrder(orderId, session.user.access_token);
      toast.success("Đã huỷ đơn hàng");
      onCancelled(orderId);
    } catch {
      toast.error("Huỷ đơn thất bại. Vui lòng thử lại.");
    } finally {
      setCancelling(false);
    }
  };

  if (cancellable.has(status)) {
    return (
      <Button
        variant="outline"
        disabled={cancelling}
        onClick={handleCancel}
        className="px-4 py-2 h-auto border-red-500 text-red-600 text-sm font-semibold hover:bg-red-50 hover:text-red-600 cursor-pointer"
      >
        {cancelling ? "Đang huỷ..." : "Huỷ đơn"}
      </Button>
    );
  }
  if (status === "DELIVERED") {
    return (
      <>
        <Button variant="outline" className="px-4 py-2 h-auto border-black text-sm font-semibold cursor-pointer">
          Đánh giá
        </Button>
        <Button variant="outline" className="px-4 py-2 h-auto border-gray-300 text-sm cursor-pointer">
          Yêu cầu trả hàng/hoàn tiền
        </Button>
        <BuyAgainButton orderItems={orderItems} />
      </>
    );
  }
  if (status === "COMPLETED") {
    return (
      <>
        <Button variant="outline" className="px-4 py-2 h-auto border-black text-sm font-semibold cursor-pointer">
          Đánh giá
        </Button>
        <BuyAgainButton orderItems={orderItems} />
      </>
    );
  }
  if (status === "CANCELLED" || status === "RETURNED") {
    return <BuyAgainButton orderItems={orderItems} />;
  }
  // SHIPPED, DELIVERED_FAILED — no actions
  return null;
}

export default function OrdersContent() {
  const [orders, setOrders] = useState<OrderFullInformationEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const pageRef = useRef(1);
  const { data: session } = useSession();
  const router = useRouter();

  const handleOrderCancelled = (orderId: number) => {
    router.push(`/profile/orders/${orderId}`);
  };

  const fetchPage = async (page: number, append: boolean) => {
    if (!session?.user?.id || !session?.user?.access_token) return;

    const userId = parseInt(session.user.id, 10);
    const token = session.user.access_token;
    console.log("[OrdersContent] Loading orders for user:", userId, "tab:", activeTab, "page:", page);

    if (append) setLoadingMore(true);
    else setIsLoading(true);

    try {
      const fetchers: Record<TabKey, () => Promise<IBackendRes<OrderFullInformationEntity[]>>> = {
        all:       () => orderService.getUserOrders(userId, token, page, PER_PAGE),
        confirmed: () => orderService.getUserConfirmedOrders(userId, token, page, PER_PAGE),
        shipped:   () => orderService.getUserShippedOrders(userId, token, page, PER_PAGE),
        delivered: () => orderService.getUserDeliveredOrders(userId, token, page, PER_PAGE),
        completed: () => orderService.getUserCompletedOrders(userId, token, page, PER_PAGE),
        cancelled: () => orderService.getUserCancelledOrders(userId, token, page, PER_PAGE),
        returned:  () => orderService.getUserReturnedOrders(userId, token, page, PER_PAGE),
      };
      const response = await fetchers[activeTab]();
      console.log("[OrdersContent] Orders response page", page, ":", response);
      const incoming = Array.isArray(response.data) ? response.data : [];
      setOrders((prev) => (append ? [...prev, ...incoming] : incoming));
      setHasMore(incoming.length === PER_PAGE);
    } catch (error) {
      console.error("[OrdersContent] Failed to load orders:", error);
      if (!append) setOrders([]);
    } finally {
      if (append) setLoadingMore(false);
      else setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!session?.user?.id || !session?.user?.access_token) {
      setIsLoading(false);
      return;
    }
    pageRef.current = 1;
    fetchPage(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, session?.user?.access_token, activeTab]);

  const handleLoadMore = () => {
    const next = pageRef.current + 1;
    pageRef.current = next;
    fetchPage(next, true);
  };

  if (isLoading) {
    return (
      <>
        <h1 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h1>
        <div className="text-center text-gray-600 py-8">Đang tải...</div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h1>

      {/* Status tabs */}
      <div className="overflow-x-auto mb-6 border-b">
        <div className="flex min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === tab.key
                  ? "border-b-2 border-black font-semibold text-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="flex items-center gap-3 max-w-2xl">
          <div className="flex-1 flex items-stretch border">
            <Input
              type="text"
              placeholder="Tìm kiếm theo ID đơn hàng hoặc Tên Sản phẩm"
              className="flex-1 text-sm border-0 shadow-none focus-visible:ring-0"
            />
            <Button variant="ghost" className="px-4 bg-gray-50 hover:bg-gray-100 h-auto cursor-pointer">
              <i className="fa-solid fa-magnifying-glass text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="border bg-white p-12 text-center text-gray-500">
            <i className="fa-solid fa-box-open text-4xl mb-4 text-gray-300" />
            <p>{activeTab === "all" ? "Bạn chưa có đơn hàng nào" : "Không có đơn hàng nào trong mục này"}</p>
          </div>
        ) : (
          <>
          {orders.map((order) => {
            const statusInfo = STATUS_CONFIG[order.status] ?? { text: order.status, color: "text-gray-600" };
            const orderDate = new Date(order.orderDate).toLocaleDateString("vi-VN");
            const payment = order.payment?.[0];

            return (
              <div key={order.id} className="border bg-white group">
                {/* Order header */}
                <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    <Link href={`/profile/orders/${order.id}`} className="text-gray-600 hover:underline cursor-pointer">
                      Mã đơn: <span className="font-semibold text-black">#{order.id}</span>
                    </Link>
                    <span className="text-gray-600">
                      Ngày đặt: <span className="text-black">{orderDate}</span>
                    </span>
                    {payment && (
                      <span className="text-gray-600">
                        {PAYMENT_METHOD_LABEL[payment.paymentMethod] ?? payment.paymentMethod}
                      </span>
                    )}
                  </div>
                  <span className={`text-sm font-semibold whitespace-nowrap ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                </div>

                {/* Order items */}
                {order.orderItems?.length > 0 && (
                  <div className="divide-y">
                    {order.orderItems.map((item) => {
                      const imageUrl = item.productVariant?.media?.[0]?.url;
                      return (
                        <div key={item.id} className="px-4 py-3 flex items-center gap-4">
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
                            <p className="text-sm font-medium text-black truncate">
                              {item.productVariant?.variantName ?? `Variant #${item.productVariantId}`}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {item.productVariant?.variantColor && (
                                <span>Màu: {item.productVariant.variantColor}</span>
                              )}
                              {item.productVariant?.variantSize && (
                                <span className="ml-2">Size: {item.productVariant.variantSize}</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">x{item.quantity}</p>
                          </div>
                          <div className="text-sm text-right flex-shrink-0">
                            <p className="font-medium text-black">{VND.format(item.unitPrice)}</p>
                            {item.discountValue > 0 && (
                              <p className="text-xs text-green-600">-{VND.format(item.discountValue)}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pricing summary */}
                <div className="px-4 py-3 border-t bg-gray-50/50">
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Tạm tính: {VND.format(order.subTotal)}</p>
                    <p>Phí vận chuyển: {VND.format(order.shippingFee)}</p>
                    {order.discount > 0 && (
                      <p className="text-green-600">Giảm giá: -{VND.format(order.discount)}</p>
                    )}
                  </div>
                </div>

                {/* Order footer */}
                <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/profile/orders/${order.id}`}>
                      <Button variant="outline" className="px-4 py-2 h-auto border-black text-sm font-semibold cursor-pointer">
                        Xem chi tiết
                      </Button>
                    </Link>
                    <OrderActions status={order.status} orderId={order.id} orderItems={order.orderItems ?? []} onCancelled={handleOrderCancelled} />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Tổng tiền:</p>
                    <p className="text-xl font-bold text-red-600">
                      {VND.format(order.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          {hasMore && (
            <div className="flex justify-center pt-2 pb-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-8 py-2 h-auto border-gray-300 text-sm cursor-pointer"
              >
                {loadingMore ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Đang tải...</>
                ) : (
                  "Xem thêm"
                )}
              </Button>
            </div>
          )}
          </>
        )}
      </div>
    </>
  );
}
