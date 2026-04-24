"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Search, Loader2 } from "lucide-react";
import { orderService } from "@/services/order";
import type { OrderFullInformationEntity } from "@/dto/order";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { STATUS_CONFIG } from "./_components/orderStatusConfig";
import OrderDetailSheet from "./_components/OrderDetailSheet";

const ROW_HEIGHT = 56;
const PER_PAGE = 50;
const COLS = "48px 2fr 160px 140px 120px 120px 160px 130px";

type FilterTab =
  | "all"
  | "waiting"
  | "shipping"
  | "delivered"
  | "pending_return"
  | "returned";

const TAB_FETCHER: Record<
  FilterTab,
  (
    page: number,
    perPage: number,
    token: string
  ) => Promise<IBackendRes<OrderFullInformationEntity[]>>
> = {
  all: (p, pp, t) => orderService.getAllOrderDetails(p, pp, t),
  waiting: (p, pp, t) => orderService.getShopConfirmedOrders(p, pp, t),
  shipping: (p, pp, t) => orderService.getShopShippedOrders(p, pp, t),
  delivered: (p, pp, t) => orderService.getShopDeliveredOrders(p, pp, t),
  pending_return: (p, pp, t) => orderService.getShopOrdersWithPendingReturn(p, pp, t),
  returned: (p, pp, t) => orderService.getShopReturnedOrders(p, pp, t),
};


const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

export default function AdminOrdersPage() {
  const { data: session } = useSession();
  const accessToken = session?.user?.access_token || "";

  const [orders, setOrders] = useState<OrderFullInformationEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderFullInformationEntity | null>(null);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  // --- Data fetching ---
  const fetchOrders = useCallback(
    async (page: number, append: boolean, tab: FilterTab) => {
      if (!accessToken) return;
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        console.log("[OrdersPage] Fetching orders tab:", tab, "page:", page);
        const res = await TAB_FETCHER[tab](page, PER_PAGE, accessToken);
        const data = Array.isArray(res.data) ? res.data : [];
        console.log("[OrdersPage] Fetched", data.length, "orders");

        if (append) {
          setOrders((prev) => [...prev, ...data]);
        } else {
          setOrders(data);
        }
        setHasMore(data.length > 0);
      } catch (err) {
        console.error("[OrdersPage] Error fetching orders:", err);
        if (!append) setOrders([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [accessToken]
  );

  // Initial load + re-fetch when tab changes
  useEffect(() => {
    pageRef.current = 1;
    fetchOrders(1, false, activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOrders, activeTab]);

  const loadNextPage = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;
    fetchOrders(nextPage, true, activeTab);
  }, [loadingMore, hasMore, fetchOrders, activeTab]);

  // --- Filtered list (client-side search only) ---
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.trim().toLowerCase();
    return orders.filter(
      (o) => String(o.id).includes(q) || String(o.userId).includes(q)
    );
  }, [orders, searchQuery]);

  // --- Virtualizer ---
  const rowVirtualizer = useVirtualizer({
    count: filteredOrders.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  // Infinite scroll
  useEffect(() => {
    if (!hasMore || loadingMore || loading) return;
    const virtualItems = rowVirtualizer.getVirtualItems();
    const lastVisible = virtualItems[virtualItems.length - 1];
    const nearEnd = lastVisible
      ? lastVisible.index >= filteredOrders.length - 5
      : filteredOrders.length > 0;
    if (nearEnd) loadNextPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    rowVirtualizer.getVirtualItems(),
    filteredOrders.length,
    hasMore,
    loadingMore,
    loading,
    loadNextPage,
  ]);

  // --- Row click ---
  const handleRowClick = (order: OrderFullInformationEntity) => {
    setSelectedOrder(order);
  };

  const handleOrderUpdated = (updated: OrderFullInformationEntity) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setSelectedOrder(updated);
  };

  return (
    <div className="p-6 flex flex-col gap-4 h-full min-h-0">
      {/* Header */}
      <h1 className="text-2xl font-bold text-[var(--admin-green-dark)]">
        Quản lý đơn hàng
      </h1>

      {/* Filter tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as FilterTab)}
      >
        <TabsList className="bg-[var(--admin-green-light)]">
          <TabsTrigger value="all" className="cursor-pointer">
            Tất cả
          </TabsTrigger>
          <TabsTrigger value="waiting" className="cursor-pointer">
            Đang chờ
          </TabsTrigger>
          <TabsTrigger value="shipping" className="cursor-pointer">
            Đang trên đường
          </TabsTrigger>
          <TabsTrigger value="delivered" className="cursor-pointer">
            Đã giao
          </TabsTrigger>
          <TabsTrigger value="pending_return" className="cursor-pointer">
            Yêu cầu trả hàng
          </TabsTrigger>
          <TabsTrigger value="returned" className="cursor-pointer">
            Hoàn tiền
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Tìm theo mã đơn, khách hàng..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table header */}
      <div
        style={{ display: "grid", gridTemplateColumns: COLS }}
        className="bg-[var(--admin-green-light)] rounded-lg px-4 py-2 text-sm font-semibold text-[var(--admin-green-dark)] flex-shrink-0"
      >
        <div className="flex items-center">#</div>
        <div className="flex items-center">Sản phẩm</div>
        <div className="flex items-center">Khách hàng</div>
        <div className="flex items-center">Thời gian</div>
        <div className="flex items-center">Giá</div>
        <div className="flex items-center">Phương thức</div>
        <div className="flex items-center">Mã vận đơn</div>
        <div className="flex items-center">Tình trạng</div>
      </div>

      {/* Virtual scroll container */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-[var(--admin-green-dark)] w-8 h-8" />
        </div>
      ) : (
        <div
          ref={tableContainerRef}
          className="overflow-auto flex-1 relative border border-gray-200 rounded-lg min-h-0"
        >
          <div
            style={{
              height: rowVirtualizer.getTotalSize(),
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((vi) => {
              const order = filteredOrders[vi.index];
              const firstItem = order.orderItems?.[0];
              const thumbUrl =
                firstItem?.productVariant?.media?.[0]?.url ?? null;
              const productName =
                firstItem?.productVariant?.variantName ?? "—";
              const paymentMethod =
                order.payment?.[0]?.paymentMethod ?? "—";
              const shipment = order.shipments?.[0];
              const trackingCode =
                shipment?.ghnOrderCode ?? shipment?.trackingNumber ?? "—";
              const statusCfg = STATUS_CONFIG[order.status];
              const StatusIcon = statusCfg.icon;

              return (
                <div
                  key={order.id}
                  style={{
                    position: "absolute",
                    top: 0,
                    transform: `translateY(${vi.start}px)`,
                    display: "grid",
                    gridTemplateColumns: COLS,
                    width: "100%",
                    height: ROW_HEIGHT,
                  }}
                  onClick={() => handleRowClick(order)}
                  className="cursor-pointer hover:bg-gray-50 border-b border-gray-100 px-4 items-center text-sm"
                >
                  {/* STT */}
                  <div className="text-gray-400 text-xs">{vi.index + 1}</div>

                  {/* Sản phẩm */}
                  <div className="flex items-center gap-2 overflow-hidden">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={productName}
                        className="w-8 h-8 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-gray-100 flex-shrink-0" />
                    )}
                    <span className="truncate text-gray-700">{productName}</span>
                  </div>

                  {/* Khách hàng */}
                  <div className="text-gray-600 truncate">#{order.userId}</div>

                  {/* Thời gian */}
                  <div className="text-gray-600">{formatDate(order.orderDate)}</div>

                  {/* Giá */}
                  <div className="text-gray-800 font-medium">
                    {order.totalAmount.toLocaleString("vi-VN")}đ
                  </div>

                  {/* Phương thức */}
                  <div className="text-gray-600 truncate">{paymentMethod}</div>

                  {/* Mã vận đơn */}
                  <div className="text-gray-600 truncate font-mono text-xs">
                    {trackingCode}
                  </div>

                  {/* Tình trạng */}
                  <div
                    className="flex items-center gap-1 text-xs font-medium whitespace-nowrap"
                    style={{ color: statusCfg.color }}
                  >
                    <StatusIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    {statusCfg.label}
                  </div>
                </div>
              );
            })}
          </div>

          {loadingMore && (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-gray-400 w-5 h-5" />
            </div>
          )}

          {!loading && filteredOrders.length === 0 && (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              Không có đơn hàng nào
            </div>
          )}
        </div>
      )}

      <OrderDetailSheet
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  );
}
