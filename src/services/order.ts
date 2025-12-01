import { sendRequest } from "@/utils/api";
import type {
  CreateOrderDto,
  UpdateOrderDto,
  OrderDto,
  CreateOrderItemDto,
  UpdateOrderItemDto,
  OrderItemDto,
  OrderWithDetails,
} from "@/dto/order";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export const orderService = {
  /**
   * Create a new order
   * @param data Order data following CreateOrderDto schema
   * @param accessToken Bearer authentication token
   * @returns Backend response with created OrderDto
   */
  async createOrder(data: CreateOrderDto, accessToken: string): Promise<IBackendRes<OrderDto>> {
    const url = `${BACKEND_URL}/orders`;
    console.log("[OrderService] Creating order:", data);
    const response = await sendRequest<IBackendRes<OrderDto>>({
      url,
      method: "POST",
      body: data,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("[OrderService] Create order response:", response);
    return response;
  },

  /**
   * Get all orders created by a specific user
   * @param userId User ID to fetch orders for
   * @param accessToken Bearer authentication token
   * @returns Backend response with array of orders
   */
  async getUserOrders(userId: number, accessToken: string): Promise<IBackendRes<OrderDto[]>> {
    const url = `${BACKEND_URL}/user/${userId}/order-list`;
    console.log("[OrderService] Fetching orders for user:", userId);
    const response = await sendRequest<IBackendRes<OrderDto[]>>({
      url,
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("[OrderService] Get user orders response:", response);
    return response;
  },

  /**
   * Get a specific order by ID
   * @param orderId Order ID to fetch
   * @param accessToken Bearer authentication token
   * @returns Backend response with OrderDto
   */
  async getOrderById(orderId: number, accessToken: string): Promise<IBackendRes<OrderDto>> {
    const url = `${BACKEND_URL}/orders/${orderId}`;
    console.log("[OrderService] Fetching order:", orderId);
    const response = await sendRequest<IBackendRes<OrderDto>>({
      url,
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("[OrderService] Get order response:", response);
    return response;
  },

  /**
   * Update an existing order
   * @param orderId Order ID to update
   * @param data Order update data
   * @param accessToken Bearer authentication token
   * @returns Backend response with updated OrderDto
   */
  async updateOrder(orderId: number, data: UpdateOrderDto, accessToken: string): Promise<IBackendRes<OrderDto>> {
    const url = `${BACKEND_URL}/orders/${orderId}`;
    console.log("[OrderService] Updating order:", { orderId, data });
    const response = await sendRequest<IBackendRes<OrderDto>>({
      url,
      method: "PATCH",
      body: data,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("[OrderService] Update order response:", response);
    return response;
  },

  /**
   * Create a new order item
   * @param data Order item data following CreateOrderItemDto schema
   * @param accessToken Bearer authentication token
   * @returns Backend response with created OrderItemDto
   */
  async createOrderItem(data: CreateOrderItemDto, accessToken: string): Promise<IBackendRes<OrderItemDto>> {
    const url = `${BACKEND_URL}/order-items`;
    console.log("[OrderService] Creating order item:", data);
    const response = await sendRequest<IBackendRes<OrderItemDto>>({
      url,
      method: "POST",
      body: data,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("[OrderService] Create order item response:", response);
    return response;
  },

  /**
   * Update an existing order item
   * @param itemId Order item ID to update
   * @param data Order item update data
   * @param accessToken Bearer authentication token
   * @returns Backend response with updated OrderItemDto
   */
  async updateOrderItem(itemId: number, data: UpdateOrderItemDto, accessToken: string): Promise<IBackendRes<OrderItemDto>> {
    const url = `${BACKEND_URL}/order-items/${itemId}`;
    console.log("[OrderService] Updating order item:", { itemId, data });
    const response = await sendRequest<IBackendRes<OrderItemDto>>({
      url,
      method: "PATCH",
      body: data,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("[OrderService] Update order item response:", response);
    return response;
  },

  /**
   * Delete an order item
   * @param itemId Order item ID to delete
   * @param accessToken Bearer authentication token
   * @returns Backend response confirming deletion
   */
  async deleteOrderItem(itemId: number, accessToken: string): Promise<IBackendRes<void>> {
    const url = `${BACKEND_URL}/order-items/${itemId}`;
    console.log("[OrderService] Deleting order item:", itemId);
    const response = await sendRequest<IBackendRes<void>>({
      url,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("[OrderService] Delete order item response:", response);
    return response;
  },
};
