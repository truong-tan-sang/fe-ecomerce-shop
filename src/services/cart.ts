import { sendRequest } from "@/utils/api";
import type {
  CartDto,
  CreateCartDto,
  UpdateCartDto,
  CartItemDto,
  CreateCartItemDto,
  UpdateCartItemDto,
} from "@/dto/cart-api";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export const cartService = {
  // Cart operations
  async createCart(userId: number, data: CreateCartDto, accessToken: string): Promise<IBackendRes<CartDto>> {
    const url = `${BACKEND_URL}/user/${userId}/cart`;
    console.log("[CartService] Creating cart for user:", userId, data);
    const response = await sendRequest<IBackendRes<CartDto>>({
      url,
      method: "POST",
      body: data,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("[CartService] Create cart response:", response);
    return response;
  },

  async getCartById(userId: number, accessToken: string): Promise<IBackendRes<CartDto>> {
    const url = `${BACKEND_URL}/user/${userId}/cart`;
    console.log("[CartService] Fetching cart for user:", userId);
    const response = await sendRequest<IBackendRes<CartDto>>({
      url,
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("[CartService] Get cart response:", response);
    return response;
  },



  async getCartDetails(userId: number, accessToken: string): Promise<IBackendRes<any>> {
    const url = `${BACKEND_URL}/user/${userId}/cart/cart-details`;
    console.log("[CartService] Fetching cart details for user:", userId);
    const response = await sendRequest<IBackendRes<any>>({
      url,
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("[CartService] Cart details response:", response);
    return response;
  },

  async updateCart(userId: number, data: UpdateCartDto, accessToken: string): Promise<IBackendRes<CartDto>> {
    const url = `${BACKEND_URL}/user/${userId}/cart`;
    console.log("[CartService] Updating cart for user:", { userId, data });
    const response = await sendRequest<IBackendRes<CartDto>>({
      url,
      method: "PATCH",
      body: data,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("[CartService] Update cart response:", response);
    return response;
  },

  // Cart item operations
  async createCartItem(userId: number, data: CreateCartItemDto, accessToken: string): Promise<IBackendRes<CartItemDto>> {
    const url = `${BACKEND_URL}/user/${userId}/cart/cart-item`;
    console.log("[CartService] Creating cart item for user:", userId, data);
    const response = await sendRequest<IBackendRes<CartItemDto>>({
      url,
      method: "POST",
      body: data,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("[CartService] Create cart item response:", response);
    return response;
  },



  async updateCartItem(
    itemId: number,
    data: UpdateCartItemDto,
    accessToken: string
  ): Promise<IBackendRes<CartItemDto>> {
    const url = `${BACKEND_URL}/cart-items/${itemId}`;
    console.log("[CartService] Updating cart item:", { itemId, data });
    const response = await sendRequest<IBackendRes<CartItemDto>>({
      url,
      method: "PATCH",
      body: data,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("[CartService] Update cart item response:", response);
    return response;
  },

  async deleteCartItem(itemId: number, accessToken: string): Promise<IBackendRes<void>> {
    const url = `${BACKEND_URL}/cart-items/${itemId}`;
    console.log("[CartService] Deleting cart item:", itemId);
    const response = await sendRequest<IBackendRes<void>>({
      url,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("[CartService] Delete cart item response:", response);
    return response;
  },

  async getAllCartItems(accessToken: string): Promise<IBackendRes<CartItemDto[]>> {
    const url = `${BACKEND_URL}/cart-items`;
    console.log("[CartService] Fetching all cart items");
    const response = await sendRequest<IBackendRes<CartItemDto[]>>({
      url,
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("[CartService] All cart items response:", response);
    return response;
  },
};

export type CartServiceType = typeof cartService;
