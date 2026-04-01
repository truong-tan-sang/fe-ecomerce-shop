'use client';
import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import ColorSwatch from "./ColorSwatch";
import type { ProductVariantWithMediaEntity } from "@/dto/product";
import type { ColorEntity } from "@/dto/color";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80";

interface ProductCardProps {
  id: string;
  name: string;
  stock: number;
  variants: ProductVariantWithMediaEntity[];
  colors: ColorEntity[];
}

/** Deduplicate colors present in this product's variants, matched to ColorEntity for hex */
function useProductColors(variants: ProductVariantWithMediaEntity[], colors: ColorEntity[]) {
  return useMemo(() => {
    const colorMap = new Map(colors.map((c) => [c.id, c]));
    const seen = new Set<number>();
    const result: { colorEntity: ColorEntity; imageUrl: string }[] = [];

    // Pick the first size found, then collect one image per unique color
    const firstSize = variants[0]?.variantSize;
    if (!firstSize) return result;

    for (const v of variants) {
      if (v.variantSize !== firstSize) continue;
      if (seen.has(v.colorId)) continue;
      seen.add(v.colorId);

      const entity = colorMap.get(v.colorId);
      if (!entity) continue;

      const imageUrl = v.media?.[0]?.url || PLACEHOLDER_IMAGE;
      result.push({ colorEntity: entity, imageUrl });
    }

    return result;
  }, [variants, colors]);
}

export default function ProductCard({
  id,
  name,
  stock,
  variants,
  colors,
}: ProductCardProps) {
  const productColors = useProductColors(variants, colors);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  const inStock = stock > 0;
  const variantCount = variants.length;

  // Current image based on selected color
  const currentImage = productColors[selectedColorIndex]?.imageUrl || PLACEHOLDER_IMAGE;

  // Price: find lowest and highest across all variants
  const { lowestPrice, highestPrice } = useMemo(() => {
    if (variants.length === 0) return { lowestPrice: 0, highestPrice: 0 };
    const prices = variants.map((v) => v.price);
    return { lowestPrice: Math.min(...prices), highestPrice: Math.max(...prices) };
  }, [variants]);

  const hasDiscount = highestPrice > lowestPrice && lowestPrice > 0;
  const discountPercent = hasDiscount
    ? Math.round(((highestPrice - lowestPrice) / highestPrice) * 100)
    : 0;

  const formatPrice = (p: number) => `${p.toLocaleString("vi-VN")} ₫`;

  return (
    <Link
      href={`/product/${id}`}
      className={`relative w-full bg-white flex flex-col group cursor-pointer border border-gray-200 hover:border-black transition-all duration-300 hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)] ${!inStock ? "opacity-60" : ""}`}
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-gray-50 overflow-hidden">
        <Image
          src={currentImage}
          alt={name}
          fill
          className={`object-cover transition-transform duration-500 group-hover:scale-[1.03] ${!inStock ? "grayscale-[30%]" : ""}`}
          sizes="256px"
          unoptimized
        />

        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 text-[11px] font-medium z-10">
          {!inStock ? (
            <span className="px-2 py-0.5 border bg-black text-white border-black">
              Hết hàng
            </span>
          ) : (
            <span className="px-2 py-0.5 border bg-white/90 text-black border-gray-200 backdrop-blur-sm">
              Còn {stock}
            </span>
          )}
          {variantCount > 0 && inStock && (
            <span className="px-2 py-0.5 border bg-white/90 text-black border-gray-200 backdrop-blur-sm">
              {variantCount} phiên bản
            </span>
          )}
          {hasDiscount && inStock && (
            <span className="px-2 py-0.5 bg-red-600 text-white border border-red-600 font-bold">
              -{discountPercent}%
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col gap-2.5 p-3 justify-between">
        <div className="space-y-1.5">
          <div className="text-sm md:text-base font-semibold leading-tight line-clamp-2 text-black">
            {name}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm md:text-base font-bold text-black">
              {formatPrice(lowestPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(highestPrice)}
              </span>
            )}
          </div>
        </div>
        {productColors.length > 1 && (
          <div className="flex gap-2 mt-1">
            {productColors.map((pc, i) => (
              <ColorSwatch
                key={pc.colorEntity.id}
                color={pc.colorEntity.hexCode}
                variant={selectedColorIndex === i ? "clicked" : "default"}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedColorIndex(i);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
