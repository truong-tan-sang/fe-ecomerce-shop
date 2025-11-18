"use client";

import Header from "@/components/header/navbar";
import Image from "next/image";
import { useMemo, useState } from "react";

type CartItem = {
    id: string;
    name: string;
    variant: string; // e.g., "Đen, XL"
    price: number; // unit price
    qty: number;
    imageUrl: string;
    selected: boolean;
};

const VND = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export default function CartPage() {
    const [items, setItems] = useState<CartItem[]>([
        {
            id: "1",
            name: "Lorem ipsum diam metus massa venenatis ...",
            variant: "Đen, XL",
            price: 124000,
            qty: 1,
            selected: true,
            imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=240&q=80",
        },
        {
            id: "2",
            name: "Lorem ipsum diam metus massa venenatis ...",
            variant: "Đen, XL",
            price: 124000,
            qty: 1,
            selected: false,
            imageUrl: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=240&q=80",
        },
        {
            id: "3",
            name: "Lorem ipsum diam metus massa venenatis ...",
            variant: "Đen, XL",
            price: 124000,
            qty: 1,
            selected: true,
            imageUrl: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=240&q=80",
        },
        {
            id: "4",
            name: "Lorem ipsum diam metus massa venenatis ...",
            variant: "Đen, XL",
            price: 124000,
            qty: 1,
            selected: false,
            imageUrl: "https://images.unsplash.com/photo-1520975922284-5f573bc8d83e?auto=format&fit=crop&w=240&q=80",
        },
    ]);

    const allSelected = useMemo(() => items.length > 0 && items.every((i) => i.selected), [items]);
    const selectedCount = useMemo(() => items.filter((i) => i.selected).length, [items]);
    const total = useMemo(() => items.filter((i) => i.selected).reduce((sum, i) => sum + i.price * i.qty, 0), [items]);

    const setItem = (id: string, updater: (item: CartItem) => CartItem) =>
        setItems((prev) => prev.map((i) => (i.id === id ? updater(i) : i)));

    const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

    const toggleAll = (checked: boolean) => setItems((prev) => prev.map((i) => ({ ...i, selected: checked })));

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
                    {items.map((it) => (
                        <div key={it.id} className="grid grid-cols-[24px_1fr_120px_160px_120px_80px] gap-3 items-center px-4 py-5 bg-white">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded-none border border-black accent-black cursor-pointer"
                                checked={it.selected}
                                onChange={(e) => setItem(it.id, (x) => ({ ...x, selected: e.target.checked }))}
                                aria-label="Chọn sản phẩm"
                            />

                            {/* Product cell */}
                            <div className="flex items-center gap-4">
                                <div className="relative h-20 w-20 bg-gray-100 overflow-hidden">
                                    <Image src={it.imageUrl} alt={it.name} fill className="object-cover" sizes="80px" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-black line-clamp-2">{it.name}</div>
                                    <div className="mt-2 text-sm text-gray-600">
                                        <div>Phân loại hàng: <span className="font-medium">{it.variant}</span></div>
                                    </div>
                                    <button className="mt-1 text-sm text-gray-500 hover:text-black inline-flex items-center gap-1" title="Đổi phân loại">
                                        <span>Đen, XL</span>
                                        <i className="fa-solid fa-angle-down ml-1" />
                                    </button>
                                </div>
                            </div>

                            {/* Unit price */}
                            <div className="justify-self-end text-sm text-gray-700">{VND.format(it.price)}</div>

                            {/* Quantity */}
                            <div className="justify-self-center">
                                <div className="inline-flex border">
                                    <button
                                        className="px-3 py-2 hover:bg-gray-100"
                                        onClick={() => setItem(it.id, (x) => ({ ...x, qty: Math.max(1, x.qty - 1) }))}
                                        aria-label="Giảm số lượng"
                                    >
                                        -
                                    </button>
                                    <input
                                        className="w-12 text-center border-x py-2"
                                        type="text"
                                        readOnly
                                        value={it.qty}
                                    />
                                    <button
                                        className="px-3 py-2 hover:bg-gray-100"
                                        onClick={() => setItem(it.id, (x) => ({ ...x, qty: Math.min(99, x.qty + 1) }))}
                                        aria-label="Tăng số lượng"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Line total */}
                            <div className="justify-self-end text-sm font-medium text-black">{VND.format(it.price * it.qty)}</div>

                            {/* Actions */}
                            <div className="justify-self-end">
                                <button className="text-sm text-gray-600 hover:text-red-600" onClick={() => removeItem(it.id)}>Xóa</button>
                            </div>
                        </div>
                    ))}
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
                        <button className="text-gray-600 hover:text-red-600" onClick={() => setItems((prev) => prev.filter((i) => !i.selected))}>
                            Xóa
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-700">
                            Tổng cộng (<span className="font-medium">{selectedCount} Sản phẩm</span>):
                        </div>
                        <div className="text-xl font-bold text-black">{VND.format(total)}</div>
                        <button
                            className="ml-2 bg-black text-white px-6 py-3 font-semibold hover:bg-gray-800 whitespace-nowrap"
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
