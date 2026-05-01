import type { NotificationDto } from "@/dto/notification";

const ORDER_TITLES = [
  "đặt hàng thành công",
  "đơn hàng đang chờ lấy hàng",
  "đơn hàng đang được giao",
  "giao hàng thành công",
  "giao hàng thất bại",
  "đơn hàng đã bị hủy",
  "đơn hàng hoàn thành",
  "thanh toán thành công",
  "hoàn tiền đã được xử lý",
];

const RETURN_TITLES = ["yêu cầu hoàn trả"];

const VOUCHER_TITLES = ["voucher"];

export function extractOrderId(content: string): string | null {
  const match = content.match(/#(\d+)/);
  return match ? match[1] : null;
}

export function getNotificationRoute(notification: NotificationDto): string | null {
  const titleLower = notification.title.toLowerCase();
  const contentLower = notification.content.toLowerCase();

  if (ORDER_TITLES.some((kw) => titleLower.includes(kw))) {
    const orderId = extractOrderId(notification.content) ?? extractOrderId(contentLower);
    return orderId ? `/profile/orders/${orderId}` : "/profile/orders";
  }

  if (RETURN_TITLES.some((kw) => titleLower.includes(kw))) {
    return "/profile/orders";
  }

  if (VOUCHER_TITLES.some((kw) => titleLower.includes(kw))) {
    return "/profile/vouchers";
  }

  return null;
}
