"use client";

import Image from "next/image";

const mockOrders = [
  {
    id: "1",
    date: "2025-11-15",
    items: [
      {
        id: "1",
        name: "Áo thun nam cổ tròn",
        variant: "Size: L, Màu: Đen",
        price: 299000,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80",
      },
    ],
    status: "delivered",
    total: 299000,
  },
  {
    id: "2",
    date: "2025-11-10",
    items: [
      {
        id: "2",
        name: "Quần jean slim fit",
        variant: "Size: 32, Màu: Xanh đậm",
        price: 599000,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=200&q=80",
      },
      {
        id: "3",
        name: "Giày sneaker trắng",
        variant: "Size: 42",
        price: 899000,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=200&q=80",
      },
    ],
    status: "delivered",
    total: 1498000,
  },
  {
    id: "3",
    date: "2025-11-05",
    items: [
      {
        id: "4",
        name: "Áo khoác hoodie",
        variant: "Size: XL, Màu: Xám",
        price: 799000,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=200&q=80",
      },
    ],
    status: "cancelled",
    total: 799000,
  },
];

export default function OrdersContent() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h1>

      {/* Search bar */}
      <div className="mb-6">
        <div className="flex items-center gap-3 max-w-2xl">
          <div className="flex-1 flex items-stretch border">
            <input
              type="text"
              placeholder="Tìm kiếm theo Tên Shop, ID đơn hàng hoặc Tên Sản phẩm"
              className="flex-1 px-4 py-2 text-sm focus:outline-none"
            />
            <button className="px-4 bg-gray-50 hover:bg-gray-100 transition-colors">
              <i className="fa-solid fa-magnifying-glass text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-4">
        {mockOrders.map((order) => (
          <div key={order.id} className="border bg-white">
            {/* Order header */}
            <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm">
                <span className="text-gray-600">
                  Mã đơn:{" "}
                  <span className="font-semibold text-black">{order.id}</span>
                </span>
                <span className="text-gray-600">
                  Ngày đặt: <span className="text-black">{order.date}</span>
                </span>
              </div>
              <span
                className={`text-sm font-semibold ${
                  order.status === "delivered"
                    ? "text-green-600"
                    : order.status === "cancelled"
                    ? "text-red-600"
                    : "text-orange-600"
                }`}
              >
                {order.status === "delivered"
                  ? "ĐÃ GIAO"
                  : order.status === "cancelled"
                  ? "ĐÃ HUỶ"
                  : "ĐANG XỬ LÝ"}
              </span>
            </div>

            {/* Order items */}
            <div className="p-4 space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="relative w-20 h-20 border flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                    <p className="text-xs text-gray-600">{item.variant}</p>
                    <p className="text-xs text-gray-600">x{item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {item.price.toLocaleString("vi-VN")} ₫
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order footer */}
            <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {order.status === "delivered" ? (
                  <>
                    <button className="px-4 py-2 border border-black text-sm font-semibold hover:bg-gray-100">
                      Đánh giá
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-sm hover:bg-gray-100">
                      Yêu cầu trả hàng/hoàn tiền
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-sm hover:bg-gray-100">
                      Mua lại
                    </button>
                  </>
                ) : order.status === "cancelled" ? (
                  <button className="px-4 py-2 border border-gray-300 text-sm hover:bg-gray-100">
                    Mua lại
                  </button>
                ) : (
                  <button className="px-4 py-2 border border-red-500 text-red-600 text-sm font-semibold hover:bg-red-50">
                    Yêu cầu hủy
                  </button>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Tổng tiền:</p>
                <p className="text-xl font-bold text-red-600">
                  {order.total.toLocaleString("vi-VN")} ₫
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
