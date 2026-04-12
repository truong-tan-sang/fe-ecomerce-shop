    "use client";

import Header from "@/components/header/Navbar";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cartService } from "@/services/cart";
import type { CartItemWithDetails } from "@/dto/cart-api";
import { mapCartItemToDetails } from "@/dto/cart-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const VND = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export default function CartPage() {
    const [items, setItems] = useState<CartItemWithDetails[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const { data: session } = useSession();
    const router = useRouter();

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
                const cartItems = cartDetailsResponse.data?.cartItems ?? [];
                setItems(cartItems.map(mapCartItemToDetails));
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
        if (selectedIds.size === 0) return;

        if (!window.confirm(`Xóa ${selectedIds.size} sản phẩm đã chọn?`)) return;

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
                    <div className="text-center py-12">Đang tải...</div>
                </main>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-dvh flex flex-col">
                <Header />
                <main className="mx-auto w-full max-w-7xl px-3 md:px-6 py-6">
                    <div className="text-center py-12">Vui lòng đăng nhập để xem giỏ hàng</div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-dvh flex flex-col bg-gray-50">
            <Header />
            <main className="mx-auto w-full max-w-7xl px-3 md:px-6 py-8 pt-32 md:pt-36">
                <Link href="/homepage" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-black mb-4 cursor-pointer">
                    <i className="fa-solid fa-arrow-left text-xs" />
                    Tiếp tục mua sắm
                </Link>

                {/* Header Row */}
                <div className="grid grid-cols-[24px_1fr_120px_160px_120px_80px] items-center gap-3 border bg-white px-4 py-3 text-sm text-gray-600">
                    <Checkbox
                        checked={allSelected}
                        onCheckedChange={(checked) => toggleAll(checked === true)}
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
                            <p className="text-gray-600">Giỏ hàng của bạn đang trống</p>
                        </div>
                    ) : (
                        items.map((it) => (
                            <div key={it.id} className="grid grid-cols-[24px_1fr_120px_160px_120px_80px] gap-3 items-center px-4 py-5 bg-white">
                                <Checkbox
                                    checked={selectedIds.has(it.id)}
                                    onCheckedChange={(checked) => toggleItem(it.id, checked === true)}
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
                                        <Button
                                            variant="ghost"
                                            className="px-3 py-2 h-auto"
                                            onClick={() => updateQuantity(it, it.quantity - 1)}
                                            aria-label="Giảm số lượng"
                                        >
                                            -
                                        </Button>
                                        <Input
                                            className="w-12 text-center border-x border-y-0 py-2 h-auto shadow-none focus-visible:ring-0"
                                            type="text"
                                            readOnly
                                            value={it.quantity}
                                        />
                                        <Button
                                            variant="ghost"
                                            className="px-3 py-2 h-auto"
                                            onClick={() => updateQuantity(it, it.quantity + 1)}
                                            aria-label="Tăng số lượng"
                                        >
                                            +
                                        </Button>
                                    </div>
                                </div>

                                {/* Line total */}
                                <div className="justify-self-end text-sm font-medium text-black">{VND.format((it.price || 0) * it.quantity)}</div>

                                {/* Actions */}
                                <div className="justify-self-end">
                                    <Button variant="ghost" className="text-sm text-gray-600 hover:text-red-600 h-auto p-0" onClick={() => removeItem(it.id)}>Xóa</Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer actions */}
                <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4 border px-4 py-4 bg-white">
                    <div className="flex items-center gap-4 text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                                checked={allSelected}
                                onCheckedChange={(checked) => toggleAll(checked === true)}
                            />
                            Chọn tất cả ({items.length})
                        </label>
                        <Button variant="ghost" className="text-gray-600 hover:text-red-600 h-auto p-0" onClick={removeSelected}>
                            Xóa
                        </Button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-700">
                            Tổng cộng (<span className="font-medium">{selectedCount} Sản phẩm</span>):
                        </div>
                        <div className="text-xl font-bold text-black">{VND.format(total)}</div>
                        <Button
                            className="ml-2 bg-[var(--bg-button)] text-[var(--text-inverse)] px-6 py-3 h-auto font-semibold hover:bg-[var(--bg-button-hover)] whitespace-nowrap disabled:bg-gray-300"
                            disabled={selectedCount === 0}
                            onClick={() => {
                                const selectedIdsParam = Array.from(selectedIds).join(',');
                                router.push(`/checkout?items=${selectedIdsParam}`);
                            }}
                        >
                            Mua hàng
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
