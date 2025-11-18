"use client";

const mockNotifications = [
  {
    id: "1",
    type: "order",
    title: "Đơn hàng đã được giao thành công",
    message:
      "Đơn hàng #12345 đã được giao đến bạn. Vui lòng đánh giá sản phẩm.",
    time: "2 giờ trước",
    read: false,
  },
  {
    id: "2",
    type: "promotion",
    title: "Giảm giá 20% cho đơn hàng tiếp theo",
    message: "Sử dụng mã SALE20 để nhận ưu đãi đặc biệt trong 3 ngày tới.",
    time: "1 ngày trước",
    read: false,
  },
  {
    id: "3",
    type: "order",
    title: "Đơn hàng đang được vận chuyển",
    message: "Đơn hàng #12344 đang trên đường giao đến bạn.",
    time: "2 ngày trước",
    read: true,
  },
  {
    id: "4",
    type: "system",
    title: "Cập nhật điều khoản sử dụng",
    message: "Chúng tôi đã cập nhật điều khoản sử dụng. Vui lòng xem lại.",
    time: "3 ngày trước",
    read: true,
  },
  {
    id: "5",
    type: "promotion",
    title: "Flash Sale - Giảm đến 50%",
    message: "Hàng ngàn sản phẩm giảm giá sốc trong ngày hôm nay!",
    time: "5 ngày trước",
    read: true,
  },
];

export default function NotificationsContent() {
  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Thông báo</h1>
        <button className="text-sm text-blue-600 hover:underline">
          Đánh dấu tất cả là đã đọc
        </button>
      </div>

      {/* Notifications list */}
      <div className="space-y-2">
        {mockNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 border-b transition-colors cursor-pointer ${
              notification.read ? "bg-white" : "bg-blue-50"
            } hover:bg-gray-50`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  notification.type === "order"
                    ? "bg-green-100 text-green-600"
                    : notification.type === "promotion"
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <i
                  className={`fa-solid ${
                    notification.type === "order"
                      ? "fa-box"
                      : notification.type === "promotion"
                      ? "fa-tag"
                      : "fa-info-circle"
                  }`}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3
                    className={`text-sm ${
                      notification.read ? "font-medium" : "font-bold"
                    }`}
                  >
                    {notification.title}
                  </h3>
                  {!notification.read && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500">{notification.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state placeholder */}
      {mockNotifications.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <i className="fa-regular fa-bell text-4xl mb-4" />
          <p>Chưa có thông báo nào</p>
        </div>
      )}
    </div>
  );
}
