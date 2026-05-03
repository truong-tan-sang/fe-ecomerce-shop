'use client';
import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProductVariantWithMediaEntity } from "@/dto/product";
import type { ColorEntity } from "@/dto/color";

const PLACEHOLDER_IMAGE = "/no-image.jpg";

interface ProductCardProps {
  id: string;
  name: string;
  stock: number;
  productImageUrl: string;
  variants: ProductVariantWithMediaEntity[];
  colors: ColorEntity[];
  /** Show the specific variant's color dot + size tag (used on search results page) */
  showVariantInfo?: boolean;
}

/** Deduplicate colors present in this product's variants, matched to ColorEntity for hex */
function useProductColors(variants: ProductVariantWithMediaEntity[], colors: ColorEntity[]) {
  return useMemo(() => {
    const colorMap = new Map(colors.map((c) => [c.id, c]));
    const seen = new Set<number>();
    const result: { colorEntity: ColorEntity; imageUrl: string }[] = [];

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
  productImageUrl,
  variants,
  colors,
  showVariantInfo = false,
}: ProductCardProps) {
  const productColors = useProductColors(variants, colors);
  const [hoveredColorIndex, setHoveredColorIndex] = useState<number | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  const inStock = stock > 0;
  const variantCount = variants.length;

  const currentImage =
    hoveredColorIndex !== null
      ? (productColors[hoveredColorIndex]?.imageUrl ?? productImageUrl)
      : productImageUrl;

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
          src={imgSrc ?? currentImage}
          alt={name}
          fill
          className={`object-cover transition-all duration-500 group-hover:scale-[1.03] ${!inStock ? "grayscale-[30%]" : ""}`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 256px"
          onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
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
          {variantCount > 1 && inStock && !showVariantInfo && (
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
      <div className="flex-1 flex flex-col gap-2 p-3">
        <div className="text-sm md:text-base font-semibold leading-tight line-clamp-2 text-black">
          {name}
        </div>

        {/* Variant indicator (search results) or multi-color swatches (homepage) */}
        {showVariantInfo ? (
          <div className="flex items-center gap-1.5">
            {(() => {
              const v = variants[0];
              if (!v) return null;
              const colorEntity = colors.find((c) => c.id === v.colorId);
              return (
                <>
                  {colorEntity && (
                    <div
                      className="w-4 h-4 border border-gray-300 shrink-0"
                      style={{ backgroundColor: colorEntity.hexCode }}
                      title={colorEntity.name}
                    />
                  )}
                  {v.variantSize && (
                    <span className="text-[11px] font-medium border border-gray-300 px-1.5 py-0.5 text-gray-600 leading-none">
                      {v.variantSize}
                    </span>
                  )}
                  {colorEntity && (
                    <span className="text-[11px] text-gray-400 truncate">{colorEntity.name}</span>
                  )}
                </>
              );
            })()}
          </div>
        ) : (
          productColors.length > 1 && (
            <div className="flex items-center gap-0">
              {productColors.map((pc, i) => (
                <div
                  key={pc.colorEntity.id}
                  style={{ backgroundColor: pc.colorEntity.hexCode }}
                  className="h-5 w-5 cursor-pointer transition-all duration-150 hover:w-6"
                  onMouseEnter={() => setHoveredColorIndex(i)}
                  onMouseLeave={() => setHoveredColorIndex(null)}
                  onClick={(e) => e.preventDefault()}
                />
              ))}
            </div>
          )
        )}

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
    </Link>
  );
}
