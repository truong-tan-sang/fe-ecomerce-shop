"use client";

import Header from "@/components/header/navbar";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { cartService } from "@/services/cart";
import { orderService } from "@/services/order";
import { addressService } from "@/services/address";
import AddressModal from "@/components/profile/AddressModal";
import type { CartItemWithDetails } from "@/dto/cart-api";
import type { CreateOrderDto, CreateOrderItemDto } from "@/dto/order";
import type { AddressDto } from "@/dto/address";

const VND = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItemWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedItemIdsParam = searchParams.get('items') || '';
  const selectedItemIds = new Set(selectedItemIdsParam ? selectedItemIdsParam.split(',').map(Number) : []);

  // Load cart items
  useEffect(() => {
    const loadCart = async () => {
      if (!session?.user?.id || !session?.user?.access_token) {
        console.log("[CheckoutPage] User not authenticated");
        router.push("/auth/login");
        return;
      }

      try {
        const userId = parseInt(session.user.id, 10);
        console.log("[CheckoutPage] Loading cart for user:", userId);
        
        const cartDetailsResponse = await cartService.getCartDetails(
          userId,
          session.user.access_token
        );

        const payload = cartDetailsResponse.data as any;
        const cartItems = Array.isArray(payload?.cartItems) ? payload.cartItems : [];
        
        if (cartItems.length === 0) {
          console.log("[CheckoutPage] Cart is empty, redirecting...");
          router.push("/cart");
          return;
        }

        // Filter items by selected IDs from query parameter
        // If no selection param, use all items (backward compatibility)
        const filteredItems = selectedItemIds.size > 0 
          ? cartItems.filter((ci: any) => selectedItemIds.has(ci.id))
          : cartItems;

        if (filteredItems.length === 0) {
          console.log("[CheckoutPage] No selected items found, redirecting...");
          router.push("/cart");
          return;
        }

        const itemsParsed: CartItemWithDetails[] = filteredItems.map((ci: any) => ({
          id: ci.id,
          cartId: ci.cartId,
          productVariantId: ci.productVariantId,
          quantity: ci.quantity,
          createdAt: ci.createdAt,
          updatedAt: ci.updatedAt,
          productName: ci.productVariant?.variantName ?? "Unknown Product",
          variantSize: ci.productVariant?.variantSize ?? null,
          variantColor: ci.productVariant?.variantColor ?? null,
          price: ci.productVariant?.price ?? 0,
          imageUrl: ci.productVariant?.media?.[0]?.url ?? null,
        }));

        setItems(itemsParsed);
      } catch (error) {
        console.error("[CheckoutPage] Failed to load cart:", error);
        router.push("/cart");
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [session, router]);

  // Load addresses
  useEffect(() => {
    const loadAddresses = async () => {
      if (!session?.user?.id || !session?.user?.access_token) return;

      try {
        const userId = parseInt(session.user.id, 10);
        const response = await addressService.getUserAddresses(userId, session.user.access_token);
        const addressList = Array.isArray(response.data) ? response.data : [];
        setAddresses(addressList);
        
        // Auto-select first address
        if (addressList.length > 0 && !selectedAddressId) {
          setSelectedAddressId(addressList[0].id);
        }
      } catch (error) {
        console.error("[CheckoutPage] Failed to load addresses:", error);
      }
    };

    loadAddresses();
  }, [session]);

  const subTotal = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const shippingFee = 30000; // Fixed shipping fee
  const discount = 0; // No discount for now
  const totalAmount = subTotal + shippingFee - discount;

  const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId);

  const handleAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "new") {
      setIsAddressModalOpen(true);
    } else {
      setSelectedAddressId(parseInt(value, 10));
    }
  };

  const handleAddressModalSuccess = async () => {
    // Reload addresses after creating new one
    if (!session?.user?.id || !session?.user?.access_token) return;
    
    try {
      const userId = parseInt(session.user.id, 10);
      const response = await addressService.getUserAddresses(userId, session.user.access_token);
      const addressList = Array.isArray(response.data) ? response.data : [];
      setAddresses(addressList);
      
      // Select the newly created address (last one)
      if (addressList.length > 0) {
        setSelectedAddressId(addressList[addressList.length - 1].id);
      }
    } catch (error) {
      console.error("[CheckoutPage] Failed to reload addresses:", error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!session?.user?.id || !session?.user?.access_token) {
      console.error("[CheckoutPage] User not authenticated");
      return;
    }

    if (!selectedAddressId) {
      alert("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    setIsProcessing(true);

    try {
      const userId = parseInt(session.user.id, 10);
      
      // Create order
      const orderData: CreateOrderDto = {
        shippingAddressId: selectedAddressId,
        userId,
        processByStaffId: 1, // TODO: Get from backend or use default
        orderDate: new Date().toISOString(),
        status: "PENDING",
        subTotal,
        shippingFee,
        discount,
        totalAmount,
      };

      console.log("[CheckoutPage] Creating order:", orderData);
      const orderResponse = await orderService.createOrder(orderData, session.user.access_token);
      
      if (!orderResponse.data?.id) {
        throw new Error("Failed to create order: No order ID returned");
      }

      const orderId = orderResponse.data.id;
      console.log("[CheckoutPage] Order created with ID:", orderId);

      // Create order items
      for (const item of items) {
        const orderItemData: CreateOrderItemDto = {
          orderId,
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          unitPrice: item.price || 0,
          totalPrice: (item.price || 0) * item.quantity,
        };

        console.log("[CheckoutPage] Creating order item:", orderItemData);
        await orderService.createOrderItem(orderItemData, session.user.access_token);
      }

      // Clear cart items after successful order
      for (const item of items) {
        await cartService.deleteCartItem(item.id, session.user.access_token);
      }

      console.log("[CheckoutPage] Order completed successfully");
      alert("Đặt hàng thành công!");
      router.push("/profile/orders");
    } catch (error) {
      console.error("[CheckoutPage] Failed to place order:", error);
      alert("Đặt hàng thất bại. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-32 md:pt-36">
          <div className="text-center text-gray-600">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-32 md:pt-36">
        <h1 className="text-2xl font-bold mb-6">THANH TOÁN</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shipping Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border p-6">
              <h2 className="text-lg font-bold mb-4">THÔNG TIN GIAO HÀNG</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Chọn địa chỉ giao hàng <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border px-3 py-2 focus:outline-none focus:border-black"
                    value={selectedAddressId || ""}
                    onChange={handleAddressChange}
                  >
                    <option value="" disabled>
                      -- Chọn địa chỉ --
                    </option>
                    {addresses.map((addr) => {
                      const fullAddress = `${addr.street}, ${addr.ward}, ${addr.district}, ${addr.province}`;
                      return (
                        <option key={addr.id} value={addr.id}>
                          {fullAddress}
                        </option>
                      );
                    })}
                    <option value="new" className="font-semibold">
                      + Thêm địa chỉ mới
                    </option>
                  </select>
                </div>

                {selectedAddress && (
                  <div className="bg-gray-50 border border-gray-200 p-4 text-sm">
                    <div className="font-semibold mb-1">Địa chỉ đã chọn:</div>
                    <div className="text-gray-700">
                      {selectedAddress.street}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.province}
                      {selectedAddress.zipCode && `, ${selectedAddress.zipCode}`}
                      <br />
                      {selectedAddress.country}
                    </div>
                  </div>
                )}

                {addresses.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
                    <i className="fa-solid fa-circle-info mr-2" />
                    Bạn chưa có địa chỉ nào. Vui lòng thêm địa chỉ để tiếp tục.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border p-6">
              <h2 className="text-lg font-bold mb-4">PHƯƠNG THỨC THANH TOÁN</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    className="h-4 w-4"
                    defaultChecked
                  />
                  <span className="text-sm">Thanh toán khi nhận hàng (COD)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border p-6 sticky top-4">
              <h2 className="text-lg font-bold mb-4">ĐƠN HÀNG</h2>
              
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-3 border-b">
                    {item.imageUrl && (
                      <div className="relative w-16 h-16 border flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.productName || "Product"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{item.productName}</div>
                      {(item.variantSize || item.variantColor) && (
                        <div className="text-xs text-gray-600">
                          {[item.variantSize, item.variantColor].filter(Boolean).join(", ")}
                        </div>
                      )}
                      <div className="text-sm">
                        {VND.format(item.price || 0)} × {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span>{VND.format(subTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span>{VND.format(shippingFee)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span>-{VND.format(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Tổng cộng</span>
                  <span>{VND.format(totalAmount)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing || !selectedAddressId}
                className="w-full mt-4 bg-black text-white py-3 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? "Đang xử lý..." : "ĐẶT HÀNG"}
              </button>
            </div>
          </div>
        </div>

        {/* Address Modal */}
        <AddressModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          onSuccess={handleAddressModalSuccess}
          editAddress={null}
        />
      </div>
    </div>
  );
}
