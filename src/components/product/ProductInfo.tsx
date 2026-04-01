"use client";

import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import ColorSwatch from "./ColorSwatch";
import type { ProductVariantEntity } from "@/dto/product-variant";
import type { ColorEntity } from "@/dto/color";
import { cartService } from "@/services/cart";
import Toast from "../toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/utils/api-error";

interface ProductInfoProps {
    brand: string;
    name: string;
    rating: number;
    reviewCount: number;
    basePrice: number;
    viewersCount: number;
    baseStock: number;
    variants: ProductVariantEntity[];
    colors: ColorEntity[];
    onColorChange?: (colorId: number) => void;
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
    colors,
    onColorChange,
}: ProductInfoProps) {
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColorId, setSelectedColorId] = useState<number | null>(null);

    // Build color lookup: colorId → ColorEntity
    const colorMap = useMemo(() => new Map(colors.map((c) => [c.id, c])), [colors]);

    // Extract unique sizes from variants (ordered by first appearance)
    const allSizes = useMemo(() => {
        const seen = new Set<string>();
        const result: string[] = [];
        for (const v of variants) {
            const size = v.variantSize?.toUpperCase();
            if (size && !seen.has(size)) {
                seen.add(size);
                result.push(size);
            }
        }
        return result;
    }, [variants]);

    // Extract unique colorIds present in this product's variants
    const allColorIds = useMemo(() => {
        const seen = new Set<number>();
        const result: number[] = [];
        for (const v of variants) {
            if (v.colorId && !seen.has(v.colorId)) {
                seen.add(v.colorId);
                result.push(v.colorId);
            }
        }
        return result;
    }, [variants]);
    const [quantity, setQuantity] = useState(1);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState<"success" | "error" | "info">("success");
    const [isLoading, setIsLoading] = useState(false);
    const { data: session } = useSession();

    // Find the currently selected variant based on size and colorId
    const selectedVariant = useMemo(() => {
        if (!selectedSize || !selectedColorId) return null;

        return variants.find(v =>
            v.variantSize?.toUpperCase() === selectedSize.toUpperCase() &&
            v.colorId === selectedColorId
        ) || null;
    }, [selectedSize, selectedColorId, variants]);

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

        return new Set(
            Array.from(sizeStockMap.entries())
                .filter(([_, stock]) => stock > 0)
                .map(([size]) => size)
        );
    }, [variants]);

    // Get available colorIds for the currently selected size (colors with stock > 0)
    const availableColorIds = useMemo(() => {
        if (!selectedSize) return new Set<number>();

        const ids = new Set<number>();
        variants.forEach(v => {
            if (
                v.variantSize?.toUpperCase() === selectedSize.toUpperCase() &&
                v.colorId &&
                (v.stock || 0) > 0
            ) {
                ids.add(v.colorId);
            }
        });
        return ids;
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
            const firstAvailable = allSizes.find(s => availableSizes.has(s));
            if (firstAvailable) setSelectedSize(firstAvailable);
        }
    }, [selectedSize, availableSizes, allSizes]);

    // Auto-select color when size changes or no color selected
    useEffect(() => {
        if (selectedSize && availableColorIds.size > 0) {
            if (selectedColorId && availableColorIds.has(selectedColorId)) {
                return;
            }

            const firstAvailable = allColorIds.find(id => availableColorIds.has(id));
            if (firstAvailable) {
                setSelectedColorId(firstAvailable);
                onColorChange?.(firstAvailable);
            }
        }
    }, [selectedSize, availableColorIds, selectedColorId, allColorIds, onColorChange]);

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
            let cartId: number;

            try {
                const cartResponse = await cartService.getCartById(
                    userId,
                    session.user.access_token
                );
                cartId = cartResponse.data!.id;
                console.log("[ProductInfo] Using existing cart:", cartId);
            } catch (err) {
                // Backend throws 404 (NotFoundException) when no cart exists,
                // but its own catch block re-wraps it as 400 (BadRequestException) — handle both
                if (err instanceof ApiError && (err.statusCode === 404 || err.statusCode === 400)) {
                    console.log("[ProductInfo] No cart found, creating new cart");
                    const createCartResponse = await cartService.createCart(
                        userId,
                        { userId },
                        session.user.access_token
                    );

                    if (!createCartResponse.data?.id) {
                        throw new Error("Failed to create cart");
                    }

                    cartId = createCartResponse.data.id;
                    console.log("[ProductInfo] Cart created:", cartId);
                } else {
                    throw err;
                }
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
        }
    };

    // Handle color selection by colorId
    const handleColorSelect = (colorId: number) => {
        if (availableColorIds.has(colorId)) {
            setSelectedColorId(colorId);
            onColorChange?.(colorId);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Brand */}
            <div className="text-sm text-gray-600 uppercase tracking-wider">{brand}</div>

            {/* Title & Favorite */}
            <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-black">{name}</h1>
                <Button variant="ghost" size="icon" aria-label="Add to favorites">
                    <i className="far fa-heart text-xl" />
                </Button>
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
            {allSizes.length > 0 && (
            <div>
                <div className="text-sm font-semibold text-black mb-2">
                    Size: {selectedSize || "Select a size"}
                </div>
                <div className="flex flex-wrap gap-2">
                    {allSizes.map((size) => {
                        const isAvailable = availableSizes.has(size);
                        const isSelected = selectedSize === size;

                        return (
                            <Button
                                key={size}
                                variant={isSelected ? "default" : "outline"}
                                onClick={() => handleSizeSelect(size)}
                                disabled={!isAvailable}
                                className={`px-4 py-2 text-sm font-medium ${
                                    isSelected
                                        ? "bg-black text-white border-black"
                                        : isAvailable
                                            ? "bg-white text-black border-gray-300 hover:border-black"
                                            : "bg-gray-100 text-gray-400 border-gray-200"
                                }`}
                            >
                                {size}
                            </Button>
                        );
                    })}
                </div>
            </div>
            )}

            {/* Color selector */}
            {allColorIds.length > 0 && (
            <div>
                <div className="text-sm font-semibold text-black mb-2">
                    Màu: {selectedColorId ? colorMap.get(selectedColorId)?.name ?? "Unknown" : "Select a color"}
                </div>
                <div className="flex flex-wrap gap-3">
                    {allColorIds.map((cId) => {
                        const colorEntity = colorMap.get(cId);
                        if (!colorEntity) return null;
                        const isAvailable = availableColorIds.has(cId);
                        const isSelected = selectedColorId === cId;

                        return (
                            <Button
                                key={cId}
                                variant="ghost"
                                onClick={() => handleColorSelect(cId)}
                                disabled={!isAvailable}
                                className={`relative p-0 h-auto ${!isAvailable ? 'opacity-40' : ''}`}
                                title={colorEntity.name}
                            >
                                <ColorSwatch
                                    color={colorEntity.hexCode}
                                    variant={isSelected ? "clicked-lg" : "large"}
                                    onClick={() => {}}
                                />
                                {!isAvailable && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-full h-0.5 bg-gray-400 rotate-45 transform origin-center"></div>
                                    </div>
                                )}
                            </Button>
                        );
                    })}
                </div>
            </div>
            )}

            {/* Quantity & Add to cart */}
            <div className="flex gap-3">
                <div className="flex items-center border border-gray-300">
                    <Button
                        variant="ghost"
                        onClick={decrementQty}
                        className="px-4 py-3 h-auto"
                        aria-label="Decrease quantity"
                    >
                        -
                    </Button>
                    <Input
                        type="text"
                        value={quantity}
                        readOnly
                        className="w-16 text-center py-3 h-auto border-x border-y-0 border-gray-300 shadow-none focus-visible:ring-0"
                    />
                    <Button
                        variant="ghost"
                        onClick={incrementQty}
                        className="px-4 py-3 h-auto"
                        aria-label="Increase quantity"
                    >
                        +
                    </Button>
                </div>
                <Button
                    className="flex-1 bg-black text-white py-3 px-6 h-auto font-semibold hover:bg-gray-800"
                    disabled={!selectedVariant || displayStock === 0 || isLoading}
                    onClick={handleAddToCart}
                >
                    {isLoading ? "Adding..." : displayStock === 0 ? "Out of Stock" : "Add to cart"}
                </Button>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 text-sm">
                <Button variant="outline" className="py-3 h-auto border-gray-300">
                    <i className="fas fa-balance-scale" />
                    So sánh
                </Button>
                <Button variant="outline" className="py-3 h-auto border-gray-300">
                    <i className="far fa-question-circle" />
                    Ask a question
                </Button>
                <Button variant="outline" className="col-span-2 py-3 h-auto border-gray-300">
                    <i className="fas fa-share-alt" />
                    Share
                </Button>
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
