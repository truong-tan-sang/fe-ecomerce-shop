import { sendRequest } from "@/utils/api";
import type {
  CreateOrderDto,
  UpdateOrderDto,
  OrderDto,
  OrderFullInformationEntity,
  CreateOrderItemDto,
  UpdateOrderItemDto,
  OrderItemDto,
} from "@/dto/order";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export const orderService = {
  /**
   * Create a new order (real flow with packages + shipping address)
   */
  async createOrder(
    data: CreateOrderDto,
    accessToken: string
  ): Promise<IBackendRes<OrderFullInformationEntity>> {
    const url = `${BACKEND_URL}/orders`;
    console.log("[OrderService] Creating order:", data);
    const response = await sendRequest<IBackendRes<OrderFullInformationEntity>>({
      url,
      method: "POST",
      body: data,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log("[OrderService] Create order response:", response);
    return response;
  },

  async getUserOrders(
    userId: number,
    accessToken: string
  ): Promise<IBackendRes<OrderFullInformationEntity[]>> {
    const url = `${BACKEND_URL}/user/${userId}/order-list`;
    console.log("[OrderService] Fetching orders for user:", userId);
    const response = await sendRequest<IBackendRes<OrderFullInformationEntity[]>>({
      url,
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log("[OrderService] Get user orders response:", response);
    return response;
  },

  async getUserConfirmedOrders(
    userId: number,
    accessToken: string
  ): Promise<IBackendRes<OrderFullInformationEntity[]>> {
    const url = `${BACKEND_URL}/user/${userId}/confirmed-order-list`;
    console.log("[OrderService] Fetching confirmed orders for user:", userId);
    const response = await sendRequest<IBackendRes<OrderFullInformationEntity[]>>({
      url,
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log("[OrderService] Get confirmed orders response:", response);
    return response;
  },

  async getUserShippedOrders(
    userId: number,
    accessToken: string
  ): Promise<IBackendRes<OrderFullInformationEntity[]>> {
    const url = `${BACKEND_URL}/user/${userId}/shipped-order-list`;
    console.log("[OrderService] Fetching shipped orders for user:", userId);
    const response = await sendRequest<IBackendRes<OrderFullInformationEntity[]>>({
      url,
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log("[OrderService] Get shipped orders response:", response);
    return response;
  },

  async getUserDeliveredOrders(
    userId: number,
    accessToken: string
  ): Promise<IBackendRes<OrderFullInformationEntity[]>> {
    const url = `${BACKEND_URL}/user/${userId}/delivered-order-list`;
    console.log("[OrderService] Fetching delivered orders for user:", userId);
    const response = await sendRequest<IBackendRes<OrderFullInformationEntity[]>>({
      url,
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log("[OrderService] Get delivered orders response:", response);
    return response;
  },

  async getUserCompletedOrders(
    userId: number,
    accessToken: string
  ): Promise<IBackendRes<OrderFullInformationEntity[]>> {
    const url = `${BACKEND_URL}/user/${userId}/completed-order-list`;
    console.log("[OrderService] Fetching completed orders for user:", userId);
    const response = await sendRequest<IBackendRes<OrderFullInformationEntity[]>>({
      url,
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log("[OrderService] Get completed orders response:", response);
    return response;
  },

  async getUserCancelledOrders(
    userId: number,
    accessToken: string
  ): Promise<IBackendRes<OrderFullInformationEntity[]>> {
    const url = `${BACKEND_URL}/user/${userId}/cancelled-order-list`;
    console.log("[OrderService] Fetching cancelled orders for user:", userId);
    const response = await sendRequest<IBackendRes<OrderFullInformationEntity[]>>({
      url,
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log("[OrderService] Get cancelled orders response:", response);
    return response;
  },

  async getUserReturnedOrders(
    userId: number,
    accessToken: string
  ): Promise<IBackendRes<OrderFullInformationEntity[]>> {
    const url = `${BACKEND_URL}/user/${userId}/returned-order-list`;
    console.log("[OrderService] Fetching returned orders for user:", userId);
    const response = await sendRequest<IBackendRes<OrderFullInformationEntity[]>>({
      url,
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log("[OrderService] Get returned orders response:", response);
    return response;
  },

  async getOrderById(
    orderId: number,
    accessToken: string
  ): Promise<IBackendRes<OrderDto>> {
    const url = `${BACKEND_URL}/orders/${orderId}`;
    console.log("[OrderService] Fetching order:", orderId);
    const response = await sendRequest<IBackendRes<OrderDto>>({
      url,
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log("[OrderService] Get order response:", response);
    return response;
  },

  async updateOrder(
    orderId: number,
    data: UpdateOrderDto,
    accessToken: string
  ): Promise<IBackendRes<OrderDto>> {
    const url = `${BACKEND_URL}/orders/${orderId}`;
    console.log("[OrderService] Updating order:", { orderId, data });
    const response = await sendRequest<IBackendRes<OrderDto>>({
      url,
      method: "PATCH",
      body: data,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log("[OrderService] Update order response:", response);
    return response;
  },

  async createOrderItem(
    data: CreateOrderItemDto,
    accessToken: string
  ): Promise<IBackendRes<OrderItemDto>> {
    const url = `${BACKEND_URL}/order-items`;
    console.log("[OrderService] Creating order item:", data);
    const response = await sendRequest<IBackendRes<OrderItemDto>>({
      url,
      method: "POST",
      body: data,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log("[OrderService] Create order item response:", response);
    return response;
  },

  async updateOrderItem(
    itemId: number,
    data: UpdateOrderItemDto,
    accessToken: string
  ): Promise<IBackendRes<OrderItemDto>> {
    const url = `${BACKEND_URL}/order-items/${itemId}`;
    console.log("[OrderService] Updating order item:", { itemId, data });
    const response = await sendRequest<IBackendRes<OrderItemDto>>({
      url,
      method: "PATCH",
      body: data,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log("[OrderService] Update order item response:", response);
    return response;
  },

  async getOrderDetail(
    orderId: number,
    accessToken: string
  ): Promise<IBackendRes<OrderFullInformationEntity>> {
    const url = `${BACKEND_URL}/orders/${orderId}/order-detail`;
    console.log("[OrderService] Fetching order detail:", orderId);
    const response = await sendRequest<IBackendRes<OrderFullInformationEntity>>({
      url,
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log("[OrderService] Order detail response:", response);
    return response;
  },

  async cancelOrder(
    orderId: number,
    accessToken: string
  ): Promise<IBackendRes<OrderFullInformationEntity>> {
    const url = `${BACKEND_URL}/orders/${orderId}/cancel`;
    console.log("[OrderService] Cancelling order:", orderId);
    const response = await sendRequest<IBackendRes<OrderFullInformationEntity>>({
      url,
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log("[OrderService] Cancel order response:", response);
    return response;
  },

  async deleteOrderItem(
    itemId: number,
    accessToken: string
  ): Promise<IBackendRes<void>> {
    const url = `${BACKEND_URL}/order-items/${itemId}`;
    console.log("[OrderService] Deleting order item:", itemId);
    const response = await sendRequest<IBackendRes<void>>({
      url,
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log("[OrderService] Delete order item response:", response);
    return response;
  },
};
