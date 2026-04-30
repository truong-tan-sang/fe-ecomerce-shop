import type { OrderFullInformationEntity, RequestInOrderDto, RequestInOrderStatus } from "@/dto/order";

export interface ReturnRequestOverlay {
  request: RequestInOrderDto;
  status: RequestInOrderStatus;
  label: string;
  shortLabel: string;
  className: string;
}

const ACTIVE_STATUSES: RequestInOrderStatus[] = ["PENDING", "IN_PROGRESS"];

export function getReturnRequestOverlay(
  order: Pick<OrderFullInformationEntity, "requests">,
): ReturnRequestOverlay | null {
  const request = order.requests?.find((r) => r.subject === "RETURN_REQUEST");
  if (!request) return null;
  if (!ACTIVE_STATUSES.includes(request.status)) return null;

  if (request.status === "PENDING") {
    return {
      request,
      status: request.status,
      label: "Yêu cầu trả hàng — chờ xử lý",
      shortLabel: "YC trả hàng (chờ)",
      className: "bg-[var(--status-warning-bg)] border-[var(--status-warning-border)] text-[var(--status-warning)]",
    };
  }
  return {
    request,
    status: request.status,
    label: "Yêu cầu trả hàng — đang xử lý",
    shortLabel: "YC trả hàng (đang xử lý)",
    className: "bg-[var(--status-info-bg)] border-[var(--status-info-border)] text-[var(--status-info)]",
  };
}
