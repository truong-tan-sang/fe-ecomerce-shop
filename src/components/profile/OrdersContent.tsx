"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { orderService } from "@/services/order";
import type { OrderDto } from "@/dto/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const VND = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export default function OrdersContent() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const loadOrders = async () => {
      if (!session?.user?.id || !session?.user?.access_token) {
        console.log("[OrdersContent] User not authenticated");
        setIsLoading(false);
        return;
      }

      try {
        const userId = parseInt(session.user.id, 10);
        console.log("[OrdersContent] Loading orders for user:", userId);
        
        const response = await orderService.getUserOrders(userId, session.user.access_token);
        console.log("[OrdersContent] Orders response:", response);
        
        const orderList = Array.isArray(response.data) ? response.data : [];
        setOrders(orderList);
      } catch (error) {
        console.error("[OrdersContent] Failed to load orders:", error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [session]);

  const getStatusText = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      PENDING: { text: "ĐANG XỬ LÝ", color: "text-orange-600" },
      PROCESSING: { text: "ĐANG XỬ LÝ", color: "text-orange-600" },
      PAYMENT_PROCESSING: { text: "CHỜ THANH TOÁN", color: "text-amber-600" },
      PAYMENT_CONFIRMED: { text: "ĐÃ THANH TOÁN", color: "text-blue-600" },
      WAITING_FOR_PICKUP: { text: "CHỜ LẤY HÀNG", color: "text-blue-600" },
      SHIPPED: { text: "ĐANG GIAO", color: "text-blue-600" },
      DELIVERED: { text: "ĐÃ GIAO", color: "text-green-600" },
      COMPLETED: { text: "HOÀN THÀNH", color: "text-green-600" },
      CANCELLED: { text: "ĐÃ HUỶ", color: "text-red-600" },
      RETURNED: { text: "ĐÃ TRẢ HÀNG", color: "text-red-600" },
    };
    return statusMap[status] || { text: status, color: "text-gray-600" };
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

      {/* Search bar */}
      <div className="mb-6">
        <div className="flex items-center gap-3 max-w-2xl">
          <div className="flex-1 flex items-stretch border">
            <Input
              type="text"
              placeholder="Tìm kiếm theo Tên Shop, ID đơn hàng hoặc Tên Sản phẩm"
              className="flex-1 text-sm border-0 shadow-none focus-visible:ring-0"
            />
            <Button variant="ghost" className="px-4 bg-gray-50 hover:bg-gray-100 h-auto">
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
            <p>Bạn chưa có đơn hàng nào</p>
          </div>
        ) : (
          orders.map((order) => {
            const statusInfo = getStatusText(order.status);
            const orderDate = new Date(order.orderDate).toLocaleDateString("vi-VN");
            
            return (
              <div key={order.id} className="border bg-white">
                {/* Order header */}
                <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-gray-600">
                      Mã đơn:{" "}
                      <span className="font-semibold text-black">{order.id}</span>
                    </span>
                    <span className="text-gray-600">
                      Ngày đặt: <span className="text-black">{orderDate}</span>
                    </span>
                  </div>
                  <span className={`text-sm font-semibold ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                </div>

                {/* Order summary - simplified without items */}
                <div className="p-4">
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Tạm tính: {VND.format(order.subTotal)}</p>
                    <p>Phí vận chuyển: {VND.format(order.shippingFee)}</p>
                    {order.discount > 0 && (
                      <p className="text-green-600">Giảm giá: -{VND.format(order.discount)}</p>
                    )}
                  </div>
                </div>

                {/* Order footer */}
                <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {order.status === "DELIVERED" ? (
                      <>
                        <Button variant="outline" className="px-4 py-2 h-auto border-black text-sm font-semibold">
                          Đánh giá
                        </Button>
                        <Button variant="outline" className="px-4 py-2 h-auto border-gray-300 text-sm">
                          Yêu cầu trả hàng/hoàn tiền
                        </Button>
                        <Button variant="outline" className="px-4 py-2 h-auto border-gray-300 text-sm">
                          Mua lại
                        </Button>
                      </>
                    ) : order.status === "CANCELLED" ? (
                      <Button variant="outline" className="px-4 py-2 h-auto border-gray-300 text-sm">
                        Mua lại
                      </Button>
                    ) : (
                      <Button variant="outline" className="px-4 py-2 h-auto border-red-500 text-red-600 text-sm font-semibold hover:bg-red-50 hover:text-red-600">
                        Yêu cầu hủy
                      </Button>
                    )}
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
          })
        )}
      </div>
    </>
  );
}
