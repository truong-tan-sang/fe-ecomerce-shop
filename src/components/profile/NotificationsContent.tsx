"use client";

import { useNotifications } from "@/components/notification/NotificationContext";
import { getNotificationRoute } from "@/utils/notification-route";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export default function NotificationsContent() {
  const { notifications, unreadCount, hasMore, loading, loadMore, markRead } = useNotifications();
  const router = useRouter();

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Thông báo
          {unreadCount > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({unreadCount} chưa đọc)
            </span>
          )}
        </h1>
      </div>

      {notifications.length === 0 && !loading ? (
        <div className="text-center py-16 text-gray-500">
          <i className="fa-regular fa-bell text-4xl mb-4 block" />
          <p>Chưa có thông báo nào</p>
        </div>
      ) : (
        <div className="space-y-0">
          {notifications.map((notification) => {
            const isPersonal = notification.type === "PERSONAL_NOTIFICATION";
            const unread = isPersonal && !notification.isRead;
            return (
              <div
                key={notification.id}
                className={`p-4 border-b transition-colors ${
                  unread ? "bg-blue-50" : "bg-white"
                } ${getNotificationRoute(notification) ? "cursor-pointer hover:bg-gray-50" : ""}`}
                onClick={() => {
                  if (isPersonal && unread) markRead(notification.id);
                  const route = getNotificationRoute(notification);
                  if (route) router.push(route);
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${
                      isPersonal
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    <i className={`fa-solid ${isPersonal ? "fa-box" : "fa-tag"}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`text-sm ${unread ? "font-bold" : "font-medium"}`}>
                        {notification.title}
                      </h3>
                      {unread && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.content}</p>
                    <p className="text-xs text-gray-500">{dayjs(notification.createdAt).fromNow()}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="py-6 text-center text-sm text-gray-500">Đang tải...</div>
          )}

          {hasMore && !loading && (
            <div className="pt-4 text-center">
              <Button variant="outline" onClick={loadMore} className="cursor-pointer">
                Tải thêm
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
