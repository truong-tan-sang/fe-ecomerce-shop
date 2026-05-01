"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { notificationService } from "@/services/notification";
import { orderService } from "@/services/order";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";
import { extractOrderId } from "@/utils/notification-route";
import type { NotificationDto } from "@/dto/notification";

const PER_PAGE = 20;

interface NotificationContextValue {
  notifications: NotificationDto[];
  unreadCount: number;
  hasMore: boolean;
  loading: boolean;
  orderImageMap: Record<string, string | null>;
  loadMore: () => void;
  markRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  hasMore: false,
  loading: false,
  orderImageMap: {},
  loadMore: () => {},
  markRead: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const accessToken = (session?.user as { access_token?: string })?.access_token ?? null;

  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderImageMap, setOrderImageMap] = useState<Record<string, string | null>>({});
  const pageRef = useRef(1);
  const loadedRef = useRef(false);
  const orderImageCacheRef = useRef<Record<string, string | null>>({});

  const refreshUnreadCount = useCallback(async () => {
    if (!accessToken) return;
    try {
      const count = await notificationService.getUnreadCount(accessToken);
      setUnreadCount(count);
    } catch (err) {
      console.error("[NotificationProvider] Failed to fetch unread count:", err);
    }
  }, [accessToken]);

  const fetchOrderImages = useCallback(
    async (items: NotificationDto[]) => {
      if (!accessToken) return;
      const newIds = items
        .filter((n) => n.type === "PERSONAL_NOTIFICATION")
        .map((n) => extractOrderId(n.content))
        .filter((id): id is string => id !== null && !(id in orderImageCacheRef.current));

      if (newIds.length === 0) return;
      newIds.forEach((id) => { orderImageCacheRef.current[id] = null; });

      await Promise.allSettled(
        newIds.map(async (orderId) => {
          try {
            const res = await orderService.getOrderDetail(Number(orderId), accessToken);
            const url = res.data?.orderItems?.[0]?.productVariant?.media?.[0]?.url ?? null;
            orderImageCacheRef.current[orderId] = url;
            setOrderImageMap((prev) => ({ ...prev, [orderId]: url }));
          } catch {
            // silently ignore — icon fallback is shown
          }
        })
      );
    },
    [accessToken]
  );

  const fetchPage = useCallback(
    async (page: number) => {
      if (!accessToken) return;
      setLoading(true);
      try {
        const res = await notificationService.getMyNotifications(accessToken, page, PER_PAGE);
        const items: NotificationDto[] = Array.isArray(res?.data) ? res.data : [];
        if (page === 1) {
          setNotifications(items);
        } else {
          setNotifications((prev) => [...prev, ...items]);
        }
        setHasMore(items.length === PER_PAGE);
        fetchOrderImages(items);
      } catch (err) {
        console.error("[NotificationProvider] Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    },
    [accessToken, fetchOrderImages]
  );

  useEffect(() => {
    if (!accessToken || loadedRef.current) return;
    loadedRef.current = true;
    pageRef.current = 1;
    fetchPage(1);
    refreshUnreadCount();
  }, [accessToken, fetchPage, refreshUnreadCount]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;
    fetchPage(nextPage);
  }, [loading, hasMore, fetchPage]);

  const markRead = useCallback(
    async (id: string) => {
      if (!accessToken) return;
      // optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await notificationService.markAsRead(accessToken, id);
        refreshUnreadCount();
      } catch (err) {
        console.error("[NotificationProvider] Failed to mark as read:", err);
        // revert on failure
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
        );
        refreshUnreadCount();
      }
    },
    [accessToken, refreshUnreadCount]
  );

  const handleSocketNotification = useCallback((notification: NotificationDto) => {
    setNotifications((prev) => [notification, ...prev]);
    refreshUnreadCount();
    fetchOrderImages([notification]);
  }, [refreshUnreadCount, fetchOrderImages]);

  useNotificationSocket({
    accessToken,
    onNotification: handleSocketNotification,
  });

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, hasMore, loading, orderImageMap, loadMore, markRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
