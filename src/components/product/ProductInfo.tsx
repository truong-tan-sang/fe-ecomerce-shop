"use client";

import { useState } from "react";
import ColorSwatch from "./ColorSwatch";

interface ProductInfoProps {
    brand: string;
    name: string;
    rating: number;
    reviewCount: number;
    price: number;
    originalPrice?: number;
    discount?: number;
    viewersCount: number;
    stock: number;
    sizes: string[];
    colors: { color: string; name: string }[];
}

export default function ProductInfo({
    brand,
    name,
    rating,
    reviewCount,
    price,
    originalPrice,
    discount,
    viewersCount,
    stock,
    sizes,
    colors,
}: ProductInfoProps) {
    const [selectedSize, setSelectedSize] = useState(sizes[0]);
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);

    const incrementQty = () => setQuantity((q) => Math.min(q + 1, stock));
    const decrementQty = () => setQuantity((q) => Math.max(q - 1, 1));

    return (
        <div className="flex flex-col gap-4">
            {/* Brand */}
            <div className="text-sm text-gray-600 uppercase tracking-wider">{brand}</div>

            {/* Title & Favorite */}
            <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-black">{name}</h1>
                <button className="p-2 hover:bg-gray-100 rounded transition-colors" aria-label="Add to favorites">
                    <i className="far fa-heart text-xl" />
                </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                        <i key={i} className={i < Math.floor(rating) ? "fas fa-star" : "far fa-star"} />
                    ))}
                </div>
                <span className="text-sm text-gray-600">({reviewCount})</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-black">${price.toFixed(2)}</div>
                {originalPrice && (
                    <>
                        <div className="text-lg text-gray-400 line-through">${originalPrice.toFixed(2)}</div>
                        {discount && (
                            <div className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
                                Save {discount}%
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Viewers */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <i className="far fa-eye" />
                <span>{viewersCount} people are viewing this right now</span>
            </div>

            {/* Sale countdown placeholder */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                <div className="flex items-center justify-between text-sm sm text-gray-600">
                    <span className="font-medium">Hurry up! Sale ends in:</span>
                    <div className="flex items-center gap-2 font-mono font-bold">
                        <span>00</span>:<span>05</span>:<span>59</span>:<span>47</span>
                    </div>
                </div>
            </div>

            {/* Stock */}
            <div className="text-sm text-gray-600">
                Only <span className="text-red-600 font-semibold">{stock}</span> item(s) left in stock!
            </div>

            {/* Size selector */}
            <div>
                <div className="text-sm font-semibold text-black mb-2">Size: {selectedSize}</div>
                <div className="flex gap-2">
                    {sizes.map((size) => (
                        <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-2 border text-sm font-medium transition-all ${selectedSize === size
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-black border-gray-300 hover:border-black"
                                }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            {/* Color selector */}
            <div>
                <div className="text-sm font-semibold text-black mb-2">
                    Màu: {colors[selectedColorIndex].name}
                </div>
                <div className="flex gap-3">
                    {colors.map((c, i) => (
                        <ColorSwatch
                            key={i}
                            color={c.color}
                            variant={selectedColorIndex === i ? "clicked-lg" : "large"}
                            onClick={() => setSelectedColorIndex(i)}
                        />
                    ))}
                </div>
            </div>

            {/* Quantity & Add to cart */}
            <div className="flex gap-3">
                <div className="flex items-center border border-gray-300">
                    <button
                        onClick={decrementQty}
                        className="px-4 py-3 hover:bg-gray-100 transition-colors"
                        aria-label="Decrease quantity"
                    >
                        -
                    </button>
                    <input
                        type="text"
                        value={quantity}
                        readOnly
                        className="w-16 text-center py-3 border-x border-gray-300 focus:outline-none"
                    />
                    <button
                        onClick={incrementQty}
                        className="px-4 py-3 hover:bg-gray-100 transition-colors"
                        aria-label="Increase quantity"
                    >
                        +
                    </button>
                </div>
                <button className="flex-1 bg-black text-white py-3 px-6 font-semibold hover:bg-gray-800 transition-colors">
                    Add to cart
                </button>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 text-sm">
                <button className="flex items-center justify-center gap-2 border border-gray-300 py-3 hover:bg-gray-50 transition-colors">
                    <i className="fas fa-balance-scale" />
                    So sánh
                </button>
                <button className="flex items-center justify-center gap-2 border border-gray-300 py-3 hover:bg-gray-50 transition-colors">
                    <i className="far fa-question-circle" />
                    Ask a question
                </button>
                <button className="col-span-2 flex items-center justify-center gap-2 border border-gray-300 py-3 hover:bg-gray-50 transition-colors">
                    <i className="fas fa-share-alt" />
                    Share
                </button>
            </div>

            {/* Shipping info */}
            <div className="space-y-2 text-sm border-t pt-4 mt-2">
                <div className="flex items-start gap-3">
                    <i className="fas fa-truck text-gray-600 mt-1" />
                    <div>
                        <div className="font-semibold text-black">Estimated Delivery:</div>
                        <div className="text-gray-600">Jul 30 - Aug 03</div>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <i className="fas fa-box text-gray-600 mt-1" />
                    <div>
                        <div className="font-semibold text-black">Free Shipping & Returns:</div>
                        <div className="text-gray-600">On all orders over $75</div>
                    </div>
                </div>
            </div>

            {/* Payment methods */}
            <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-2">
                    <i className="fab fa-cc-visa text-2xl text-gray-400" />
                    <i className="fab fa-cc-mastercard text-2xl text-gray-400" />
                    <i className="fab fa-cc-amex text-2xl text-gray-400" />
                    <i className="fab fa-cc-jcb text-2xl text-gray-400" />
                    <i className="fab fa-cc-discover text-2xl text-gray-400" />
                    <i className="fab fa-cc-diners-club text-2xl text-gray-400" />
                </div>
                <div className="text-xs text-gray-500">Guarantee safe & secure checkout</div>
            </div>
        </div>
    );
}
