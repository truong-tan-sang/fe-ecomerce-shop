"use client";

import Header from "@/components/header/navbar";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { cartService } from "@/services/cart";
import type { CartItemWithDetails } from "@/dto/cart-api";

const VND = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export default function CartPage() {
    const [items, setItems] = useState<CartItemWithDetails[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const { data: session } = useSession();

    // Load cart from API on mount
    useEffect(() => {
        const loadCart = async () => {
            if (!session?.user?.id || !session?.user?.access_token) {
                console.log("[CartPage] User not authenticated");
                setIsLoading(false);
                return;
            }

            try {
                const userId = parseInt(session.user.id, 10);
                console.log("[CartPage] Loading cart for user:", userId);
                
                const cartDetailsResponse = await cartService.getCartDetails(
                    userId,
                    session.user.access_token
                );

                console.log("[CartPage] Cart details:", cartDetailsResponse);
                const payload = cartDetailsResponse.data as any;
                const cartItems = Array.isArray(payload?.cartItems) ? payload.cartItems : [];
                const itemsParsed: CartItemWithDetails[] = cartItems.map((ci: any) => ({
                    id: ci.id,
                    cartId: ci.cartId,
                    productVariantId: ci.productVariantId,
                    quantity: ci.quantity,
                    createdAt: ci.createdAt,
                    updatedAt: ci.updatedAt,
                    productName: ci.productVariant?.variantName ?? undefined,
                    variantSize: ci.productVariant?.variantSize ?? null,
                    variantColor: ci.productVariant?.variantColor ?? null,
                    price: ci.productVariant?.price ?? 0,
                    imageUrl: ci.productVariant?.media?.[0]?.url ?? null,
                }));

                setItems(itemsParsed);
            } catch (error) {
                console.error("[CartPage] Failed to load cart:", error);
                setItems([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadCart();
    }, [session]);

    const allSelected = useMemo(
        () => items.length > 0 && items.every((i) => selectedIds.has(i.id)),
        [items, selectedIds]
    );
    const selectedCount = useMemo(() => selectedIds.size, [selectedIds]);
    const total = useMemo(
        () =>
            items
                .filter((i) => selectedIds.has(i.id))
                .reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0),
        [items, selectedIds]
    );

    const toggleAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(items.map((i) => i.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const toggleItem = (id: number, checked: boolean) => {
        const newSet = new Set(selectedIds);
        if (checked) {
            newSet.add(id);
        } else {
            newSet.delete(id);
        }
        setSelectedIds(newSet);
    };

    const updateQuantity = async (item: CartItemWithDetails, newQty: number) => {
        if (!session?.user?.access_token) return;
        if (newQty < 1 || newQty > 99) return;

        try {
            console.log("[CartPage] Updating quantity:", { itemId: item.id, newQty });
            await cartService.updateCartItem(
                item.id,
                {
                    quantity: newQty,
                },
                session.user.access_token
            );

            setItems((prev) =>
                prev.map((i) => (i.id === item.id ? { ...i, quantity: newQty } : i))
            );
        } catch (error) {
            console.error("[CartPage] Failed to update quantity:", error);
        }
    };

    const removeItem = async (itemId: number) => {
        if (!session?.user?.access_token) return;

        try {
            console.log("[CartPage] Removing item:", itemId);
            await cartService.deleteCartItem(itemId, session.user.access_token);
            setItems((prev) => prev.filter((i) => i.id !== itemId));
            setSelectedIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
            });
        } catch (error) {
            console.error("[CartPage] Failed to remove item:", error);
        }
    };

    const removeSelected = async () => {
        if (!session?.user?.access_token) return;

        const idsToRemove = Array.from(selectedIds);
        try {
            console.log("[CartPage] Removing selected items:", idsToRemove);
            await Promise.all(
                idsToRemove.map((id) => cartService.deleteCartItem(id, session.user.access_token!))
            );
            setItems((prev) => prev.filter((i) => !selectedIds.has(i.id)));
            setSelectedIds(new Set());
        } catch (error) {
            console.error("[CartPage] Failed to remove selected items:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-dvh flex flex-col">
                <Header />
                <main className="mx-auto w-full max-w-7xl px-3 md:px-6 py-6">
                    <div className="text-center py-12">Loading cart...</div>
                </main>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-dvh flex flex-col">
                <Header />
                <main className="mx-auto w-full max-w-7xl px-3 md:px-6 py-6">
                    <div className="text-center py-12">Please log in to view your cart</div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-dvh flex flex-col">
            <Header />
            <main className="mx-auto w-full max-w-7xl px-3 md:px-6 py-6">
                {/* Header Row */}
                <div className="grid grid-cols-[24px_1fr_120px_160px_120px_80px] items-center gap-3 border bg-white px-4 py-3 text-sm text-gray-600">
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded-none border border-black accent-black cursor-pointer"
                        checked={allSelected}
                        onChange={(e) => toggleAll(e.target.checked)}
                        aria-label="Chọn tất cả"
                    />
                    <div className="font-medium">Sản phẩm</div>
                    <div className="justify-self-end">Đơn giá</div>
                    <div className="justify-self-center">Số lượng</div>
                    <div className="justify-self-end">Số tiền</div>
                    <div className="justify-self-end">Thao tác</div>
                </div>

                {/* Items */}
                <div className="space-y-4 mt-4">
                    {items.length === 0 ? (
                        <div className="text-center py-12 bg-white">
                            <p className="text-gray-600">Your cart is empty</p>
                        </div>
                    ) : (
                        items.map((it) => (
                            <div key={it.id} className="grid grid-cols-[24px_1fr_120px_160px_120px_80px] gap-3 items-center px-4 py-5 bg-white">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded-none border border-black accent-black cursor-pointer"
                                    checked={selectedIds.has(it.id)}
                                    onChange={(e) => toggleItem(it.id, e.target.checked)}
                                    aria-label="Chọn sản phẩm"
                                />

                                {/* Product cell */}
                                <div className="flex items-center gap-4">
                                    <div className="relative h-20 w-20 bg-gray-100 overflow-hidden">
                                        <Image
                                            src={it.imageUrl || "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=240&q=80"}
                                            alt={it.productName || "Product"}
                                            fill
                                            className="object-cover"
                                            sizes="80px"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-black line-clamp-2">{it.productName || "Product"}</div>
                                        <div className="mt-2 text-sm text-gray-600">
                                            <div>Phân loại hàng: <span className="font-medium">{`${it.variantColor ?? "-"}, ${it.variantSize ?? "-"}`}</span></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Unit price */}
                                <div className="justify-self-end text-sm text-gray-700">{VND.format(it.price || 0)}</div>

                                {/* Quantity */}
                                <div className="justify-self-center">
                                    <div className="inline-flex border">
                                        <button
                                            className="px-3 py-2 hover:bg-gray-100"
                                            onClick={() => updateQuantity(it, it.quantity - 1)}
                                            aria-label="Giảm số lượng"
                                        >
                                            -
                                        </button>
                                        <input
                                            className="w-12 text-center border-x py-2"
                                            type="text"
                                            readOnly
                                            value={it.quantity}
                                        />
                                        <button
                                            className="px-3 py-2 hover:bg-gray-100"
                                            onClick={() => updateQuantity(it, it.quantity + 1)}
                                            aria-label="Tăng số lượng"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Line total */}
                                <div className="justify-self-end text-sm font-medium text-black">{VND.format((it.price || 0) * it.quantity)}</div>

                                {/* Actions */}
                                <div className="justify-self-end">
                                    <button className="text-sm text-gray-600 hover:text-red-600" onClick={() => removeItem(it.id)}>Xóa</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer actions */}
                <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4 border px-4 py-4 bg-white">
                    <div className="flex items-center gap-4 text-sm">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded-none border border-black accent-black cursor-pointer"
                                checked={allSelected}
                                onChange={(e) => toggleAll(e.target.checked)}
                            />
                            Chọn tất cả ({items.length})
                        </label>
                        <button className="text-gray-600 hover:text-red-600" onClick={removeSelected}>
                            Xóa
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-700">
                            Tổng cộng (<span className="font-medium">{selectedCount} Sản phẩm</span>):
                        </div>
                        <div className="text-xl font-bold text-black">{VND.format(total)}</div>
                        <button
                            className="ml-2 bg-black text-white px-6 py-3 font-semibold hover:bg-gray-800 whitespace-nowrap disabled:bg-gray-300 disabled:cursor-not-allowed"
                            disabled={selectedCount === 0}
                        >
                            Mua hàng
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
