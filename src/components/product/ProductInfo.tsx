"use client";

import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import ColorSwatch from "./ColorSwatch";
import type { ProductVariantDto } from "@/dto/product-detail";
import { cartService } from "@/services/cart";
import Toast from "../toast";

// Hard-coded standard sizes and colors
const STANDARD_SIZES = ["S", "M", "L", "XL", "XXL"] as const;
const STANDARD_COLORS = [
    { name: "Black", hex: "#000000" },
    { name: "Blue", hex: "#3b82f6" },
    { name: "Green", hex: "#22c55e" },
    { name: "Red", hex: "#ef4444" },
    { name: "White", hex: "#ffffff" },
] as const;

interface ProductInfoProps {
    brand: string;
    name: string;
    rating: number;
    reviewCount: number;
    basePrice: number;
    viewersCount: number;
    baseStock: number;
    variants: ProductVariantDto[];
}

export default function ProductInfo({
    brand,
    name,
    rating,
    reviewCount,
    basePrice,
    viewersCount,
    baseStock,
    variants,
}: ProductInfoProps) {
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState<"success" | "error" | "info">("success");
    const [isLoading, setIsLoading] = useState(false);
    const { data: session } = useSession();

    // Find the currently selected variant based on size and color
    const selectedVariant = useMemo(() => {
        if (!selectedSize || !selectedColor) return null;
        
        return variants.find(v => 
            v.variantSize?.toUpperCase() === selectedSize.toUpperCase() && 
            v.variantColor?.toLowerCase() === selectedColor.toLowerCase()
        ) || null;
    }, [selectedSize, selectedColor, variants]);

    // Get available sizes (those with total stock > 0 across all colors)
    const availableSizes = useMemo(() => {
        const sizeStockMap = new Map<string, number>();
        
        variants.forEach(v => {
            if (v.variantSize) {
                const sizeUpper = v.variantSize.toUpperCase();
                const currentStock = sizeStockMap.get(sizeUpper) || 0;
                sizeStockMap.set(sizeUpper, currentStock + (v.stock || 0));
            }
        });
        
        // Return sizes with total stock > 0
        return new Set(
            Array.from(sizeStockMap.entries())
                .filter(([_, stock]) => stock > 0)
                .map(([size]) => size)
        );
    }, [variants]);

    // Get available colors for the currently selected size (colors with stock > 0)
    const availableColors = useMemo(() => {
        if (!selectedSize) return new Set<string>();
        
        const colors = new Set<string>();
        
        variants.forEach(v => {
            if (
                v.variantSize?.toUpperCase() === selectedSize.toUpperCase() && 
                v.variantColor && 
                (v.stock || 0) > 0
            ) {
                colors.add(v.variantColor.toLowerCase());
            }
        });
        
        return colors;
    }, [variants, selectedSize]);

    // Calculate displayed values based on selection
    const displayPrice = selectedVariant?.price || basePrice;
    const displayStock = selectedVariant?.stock || baseStock;
    const originalPrice = useMemo(() => {
        if (!variants.length) return undefined;
        const maxPrice = Math.max(...variants.map(v => v.price));
        return maxPrice > displayPrice ? maxPrice : undefined;
    }, [variants, displayPrice]);
    const discount = originalPrice ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : undefined;

    // Auto-select first available size if none selected
    useEffect(() => {
        if (!selectedSize && availableSizes.size > 0) {
            const firstAvailable = STANDARD_SIZES.find(s => availableSizes.has(s));
            if (firstAvailable) setSelectedSize(firstAvailable);
        }
    }, [selectedSize, availableSizes]);

    // Auto-select color when size changes or no color selected
    useEffect(() => {
        if (selectedSize && availableColors.size > 0) {
            // If current color is available for this size, keep it
            if (selectedColor && availableColors.has(selectedColor)) {
                return;
            }
            
            // Otherwise, select the first available color
            const firstAvailable = STANDARD_COLORS.find(c => availableColors.has(c.name.toLowerCase()));
            if (firstAvailable) {
                setSelectedColor(firstAvailable.name.toLowerCase());
            }
        }
    }, [selectedSize, availableColors, selectedColor]);

    const incrementQty = () => setQuantity((q) => Math.min(q + 1, displayStock));
    const decrementQty = () => setQuantity((q) => Math.max(q - 1, 1));

    const handleAddToCart = async () => {
        if (!selectedVariant) return;
        if (!session?.user?.id || !session?.user?.access_token) {
            console.log("[ProductInfo] User not authenticated");
            setToastMessage("Please log in to add items to cart");
            setToastType("error");
            setShowToast(true);
            return;
        }

        setIsLoading(true);
        const userId = parseInt(session.user.id, 10);
        console.log("[ProductInfo] Adding to cart:", {
            variantId: selectedVariant.id,
            quantity,
            userId,
        });

        try {
            // Get or create user cart
            let cartResponse = await cartService.getCartById(
                userId,
                session.user.access_token
            );
            
            let cartId: number;
            
            if (!cartResponse.data) {
                console.log("[ProductInfo] No cart found, creating new cart");
                const createCartResponse = await cartService.createCart(
                    userId,
                    { 
                        userId 
                    },
                    session.user.access_token
                );
                
                if (!createCartResponse.data?.id) {
                    throw new Error("Failed to create cart");
                }
                
                cartId = createCartResponse.data.id;
                console.log("[ProductInfo] Cart created:", cartId);
            } else {
                cartId = cartResponse.data.id;
                console.log("[ProductInfo] Using existing cart:", cartId);
            }

            // Create cart item
            await cartService.createCartItem(
                userId,
                { 
                    cartId,
                    productVariantId: selectedVariant.id,
                    quantity,
                },
                session.user.access_token
            );

            console.log("[ProductInfo] Cart item created successfully");
            setToastMessage("Added to cart successfully");
            setToastType("success");
            setShowToast(true);
        } catch (error) {
            console.error("[ProductInfo] Add to cart failed:", error);
            setToastMessage("Failed to add to cart");
            setToastType("error");
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle size selection - color will auto-adjust via useEffect
    const handleSizeSelect = (size: string) => {
        if (availableSizes.has(size)) {
            setSelectedSize(size);
            // useEffect will handle color selection/adjustment
        }
    };

    // Handle color selection
    const handleColorSelect = (colorName: string) => {
        const colorLower = colorName.toLowerCase();
        if (availableColors.has(colorLower)) {
            setSelectedColor(colorLower);
        }
    };

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
                <div className="text-3xl font-bold text-black">{displayPrice.toLocaleString('vi-VN')} ₫</div>
                {originalPrice && (
                    <>
                        <div className="text-lg text-gray-400 line-through">{originalPrice.toLocaleString('vi-VN')} ₫</div>
                        {discount && (
                            <div className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
                                Save {discount}%
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Viewers */}
            {viewersCount > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <i className="far fa-eye" />
                    <span>{viewersCount} people are viewing this right now</span>
                </div>
            )}

            {/* Stock */}
            <div className="text-sm text-gray-600">
                {displayStock > 0 ? (
                    <>Only <span className="text-red-600 font-semibold">{displayStock}</span> item(s) left in stock!</>
                ) : (
                    <span className="text-red-600 font-semibold">Out of stock</span>
                )}
            </div>

            {/* Size selector */}
            <div>
                <div className="text-sm font-semibold text-black mb-2">
                    Size: {selectedSize || "Select a size"}
                </div>
                <div className="flex gap-2">
                    {STANDARD_SIZES.map((size) => {
                        const isAvailable = availableSizes.has(size);
                        const isSelected = selectedSize === size;
                        
                        return (
                            <button
                                key={size}
                                onClick={() => handleSizeSelect(size)}
                                disabled={!isAvailable}
                                className={`px-4 py-2 border text-sm font-medium transition-all ${
                                    isSelected
                                        ? "bg-black text-white border-black"
                                        : isAvailable
                                            ? "bg-white text-black border-gray-300 hover:border-black"
                                            : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                }`}
                            >
                                {size}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Color selector */}
            <div>
                <div className="text-sm font-semibold text-black mb-2">
                    Màu: {selectedColor ? STANDARD_COLORS.find(c => c.name.toLowerCase() === selectedColor)?.name : "Select a color"}
                </div>
                <div className="flex gap-3">
                    {STANDARD_COLORS.map((c) => {
                        const isAvailable = availableColors.has(c.name.toLowerCase());
                        const isSelected = selectedColor === c.name.toLowerCase();
                        
                        return (
                            <button
                                key={c.name}
                                onClick={() => handleColorSelect(c.name)}
                                disabled={!isAvailable}
                                className={`relative ${!isAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
                                title={c.name}
                            >
                                <ColorSwatch
                                    color={c.hex}
                                    variant={isSelected ? "clicked-lg" : "large"}
                                    onClick={() => {}}
                                />
                                {!isAvailable && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-full h-0.5 bg-gray-400 rotate-45 transform origin-center"></div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
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
                <button 
                    className="flex-1 bg-black text-white py-3 px-6 font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    disabled={!selectedVariant || displayStock === 0 || isLoading}
                    onClick={handleAddToCart}
                >
                    {isLoading ? "Adding..." : displayStock === 0 ? "Out of Stock" : "Add to cart"}
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

            {/* Toast notification */}
            {showToast && (
                <Toast
                    message={toastMessage}
                    type={toastType}
                    onClose={() => setShowToast(false)}
                />
            )}
        </div>
    );
}
