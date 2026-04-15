"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Loader2, MessageCircle, Pencil } from "lucide-react";
import { userService, type UserDto } from "@/services/user";
import { orderService } from "@/services/order";
import type { OrderFullInformationEntity } from "@/dto/order";
import { toast } from "sonner";
import UserDetailCard, { EmptyUserDetailCard } from "./UserDetailCard";

// ── Constants ───────────────────────────────────────────────────────────────

const ROW_HEIGHT = 57;
const PER_PAGE   = 20;

// ── Types & helpers ─────────────────────────────────────────────────────────

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

function getDisplayName(user: UserDto): string {
  return (
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.name ||
    user.username ||
    "—"
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export default function AdminUsersClient() {
  const { data: session } = useSession();
  const accessToken = session?.user?.access_token || "";

  // ── List state (mirrors coupons pattern exactly) ──
  const [users, setUsers]               = useState<UserDto[]>([]);
  const [loading, setLoading]           = useState(true);
  const [loadingMore, setLoadingMore]   = useState(false);
  const [hasMore, setHasMore]           = useState(true);
  const pageRef                         = useRef(1);

  // ── Search (debounced, client-side filter on accumulated list) ──
  const [searchInput, setSearchInput]   = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Selected user + orders ──
  const [selectedUser, setSelectedUser]   = useState<UserDto | null>(null);
  const [userOrders, setUserOrders]       = useState<OrderFullInformationEntity[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (page: number, append: boolean) => {
    if (!accessToken) return;
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const url = `/user?page=${page}&perPage=${PER_PAGE}`;
      console.log("[AdminUsers] Fetching page:", page, "| url:", url, "| append:", append);
      const res = await userService.getUsers(page, PER_PAGE, accessToken);
      console.log("[AdminUsers] Raw response:", res);
      const data = Array.isArray(res?.data) ? res.data : [];
      const newHasMore = data.length > 0;
      console.log(
        "[AdminUsers] Page", page,
        "→ got", data.length, "items",
        "| hasMore will be:", newHasMore,
        "| (stops when page returns 0 items)",
      );

      if (append) {
        setUsers((prev) => {
          const next = [...prev, ...data];
          console.log("[AdminUsers] Appended → total users now:", next.length);
          return next;
        });
      } else {
        setUsers(data);
      }

      setHasMore(newHasMore);
    } catch (err) {
      console.error("[AdminUsers] Fetch error:", err);
      if (!append) setUsers([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [accessToken]);

  // Initial load
  useEffect(() => {
    if (!accessToken) return;
    pageRef.current = 1;
    fetchUsers(1, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const loadNextPage = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const next = pageRef.current + 1;
    pageRef.current = next;
    fetchUsers(next, true);
  }, [loadingMore, hasMore, fetchUsers]);

  // ── Search ───────────────────────────────────────────────────────────────
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setAppliedSearch(value), 300);
  };

  const filteredUsers = appliedSearch.trim()
    ? users.filter((u) => {
        const q = appliedSearch.toLowerCase();
        return (
          getDisplayName(u).toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone ?? "").includes(q)
        );
      })
    : users;

  // ── Virtualizer ──────────────────────────────────────────────────────────
  const rowVirtualizer = useVirtualizer({
    count: filteredUsers.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  // Infinite scroll — same trigger logic as coupons page
  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems();
    const lastVisible  = virtualItems[virtualItems.length - 1];
    const nearEnd      = lastVisible
      ? lastVisible.index >= users.length - 5
      : users.length > 0;

    console.log(
      "[AdminUsers] Scroll check → hasMore:", hasMore,
      "| loadingMore:", loadingMore,
      "| loading:", loading,
      "| users.length:", users.length,
      "| lastVisible.index:", lastVisible?.index ?? "none",
      "| nearEnd:", nearEnd,
    );

    if (!hasMore || loadingMore || loading) return;
    if (nearEnd) loadNextPage();
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    rowVirtualizer.getVirtualItems(),
    users.length,
    hasMore,
    loadingMore,
    loading,
    loadNextPage,
  ]);

  // ── Select user ──────────────────────────────────────────────────────────
  const handleSelectUser = useCallback(async (user: UserDto) => {
    setSelectedUser(user);
    setUserOrders([]);
    if (!accessToken) return;
    setOrdersLoading(true);
    try {
      console.log("[AdminUsers] Fetching orders for user:", user.id);
      const res = await orderService.getUserOrders(user.id, accessToken);
      console.log("[AdminUsers] Orders:", res);
      setUserOrders(res?.data ?? []);
    } catch (err) {
      console.error("[AdminUsers] Order fetch error:", err);
      toast.error("Không thể tải đơn hàng của khách hàng này.");
    } finally {
      setOrdersLoading(false);
    }
  }, [accessToken]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 flex gap-5 h-full min-h-0">
      {/* Left: virtual table */}
      <div className="flex-1 min-w-0 flex flex-col gap-4 min-h-0">
        <div>
          <h1 className="text-xl font-bold text-[#023337]">Quản lý khách hàng</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Xem thông tin và quản lý tài khoản người dùng
          </p>
        </div>

        <input
          type="text"
          placeholder="Tìm theo tên, email, số điện thoại..."
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full px-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--admin-green-mid)] placeholder:text-gray-400"
        />

        <div className="bg-white shadow rounded-lg flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Fixed header */}
          <div className="bg-[#eaf8e7] flex items-center gap-4 px-2 rounded-t-lg shrink-0">
            {(["ID Khách Hàng", "Tên", "Email", "Số điện thoại", "Tình trạng"] as const).map((col) => (
              <div key={col} className="flex-1 flex items-center justify-center h-[40px] px-[10px]">
                <span className="text-[15px] font-medium text-[#023337] whitespace-nowrap">{col}</span>
              </div>
            ))}
            <div className="w-[79px] flex items-center justify-center h-[40px]">
              <span className="text-[15px] font-medium text-[#023337]">Hành động</span>
            </div>
          </div>

          {/* Body */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : (
            <div ref={tableContainerRef} className="flex-1 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-sm text-gray-400">
                  Không tìm thấy khách hàng
                </div>
              ) : (
                <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
                  {rowVirtualizer.getVirtualItems().map((vRow) => {
                    const user       = filteredUsers[vRow.index];
                    const statusCfg  = STATUS_CONFIG[getStatus(user)];
                    const isSelected = selectedUser?.id === user.id;

                    return (
                      <div
                        key={user.id}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: `${ROW_HEIGHT}px`,
                          transform: `translateY(${vRow.start}px)`,
                        }}
                        className={`flex items-center gap-4 px-2 border-b border-[#d1d5db] cursor-pointer transition-colors ${
                          isSelected ? "bg-[var(--admin-green-light)]" : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleSelectUser(user)}
                      >
                        <div className="flex-1 flex items-center justify-center px-[10px]">
                          <span className="text-[15px] text-black">#{String(user.id).padStart(4, "0")}</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center px-[12px]">
                          <span className="text-[15px] text-black truncate max-w-full">{getDisplayName(user)}</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center px-[10px]">
                          <span className="text-[15px] text-black truncate max-w-full">{user.email}</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center px-[10px]">
                          <span className="text-[15px] text-black">{user.phone || "—"}</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center px-[10px]">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${statusCfg.dotClass}`} />
                            <span className="text-[15px] whitespace-nowrap" style={{ color: statusCfg.textColor }}>
                              {statusCfg.label}
                            </span>
                          </div>
                        </div>
                        <div className="w-[79px] flex items-center justify-center gap-2">
                          <button
                            className="p-1 hover:bg-[var(--admin-green-light)] rounded cursor-pointer text-gray-500 hover:text-[#023337] transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            title="Chat"
                          >
                            <MessageCircle size={18} />
                          </button>
                          <button
                            className="p-1 hover:bg-[var(--admin-green-light)] rounded cursor-pointer text-gray-500 hover:text-[#023337] transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            title="Chỉnh sửa"
                          >
                            <Pencil size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {loadingMore && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 size={18} className="animate-spin text-gray-400" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: detail card */}
      <div className="w-[306px] shrink-0 pt-[68px]">
        {selectedUser ? (
          <UserDetailCard user={selectedUser} orders={userOrders} loading={ordersLoading} />
        ) : (
          <EmptyUserDetailCard />
        )}
      </div>
    </div>
  );
}
