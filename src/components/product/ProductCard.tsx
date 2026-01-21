'use client';
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ColorSwatch from "./ColorSwatch";

interface ProductCardProps {
  id?: string;
  imageUrl: string;
  name: string;
  price: string;
  stock?: number;
  variantCount?: number;
  colors?: { color: string; selected?: boolean }[];
  onQuickAdd?: () => void;
}

export default function ProductCard({
  id = "1",
  imageUrl,
  name,
  price,
  stock,
  variantCount,
  colors = [],
  onQuickAdd,
}: ProductCardProps) {
  const [selectedColorIndex, setSelectedColorIndex] = useState(
    colors.findIndex((c) => c.selected) !== -1 ? colors.findIndex((c) => c.selected) : 0
  );

  const inStock = typeof stock === "number" ? stock > 0 : true;
  const stockLabel = typeof stock === "number" ? `Còn ${stock}` : "Còn hàng";
  const variantsLabel = typeof variantCount === "number" && variantCount > 0 ? `${variantCount} phiên bản` : undefined;

  return (
    <Link
      href={`/product/${id}`}
      className="w-full overflow-hidden bg-white flex flex-col group cursor-pointer transition-all border border-black/10 hover:border-black shadow-[0_6px_22px_rgba(0,0,0,0.06)] hover:shadow-[0_14px_34px_rgba(0,0,0,0.14)]"
    >
      {/* Image (top) */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="256px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-2 left-2 flex flex-wrap gap-2 text-[11px] font-medium">
          <span
            className={`px-2 py-1 border ${
              inStock ? "bg-white text-black border-black/20" : "bg-gray-100 text-gray-600 border-black/10"
            }`}
          >
            {inStock ? stockLabel : "Hết hàng"}
          </span>
          {variantsLabel && (
            <span className="px-2 py-1 border bg-white text-black border-black/15">
              {variantsLabel}
            </span>
          )}
        </div>

        {/* Quick add overlay */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            type="button"
            className="w-full bg-black text-white text-xs font-medium px-3 py-2 flex items-center justify-center gap-2 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickAdd?.();
            }}
          >
            Thêm vào giỏ
            <span aria-hidden>→</span>
          </button>
        </div>
      </div>

      {/* Info (bottom) */}
      <div className="flex-1 flex flex-col gap-2 p-3 justify-between">
        <div className="space-y-1">
          <div className="text-sm md:text-base font-bold leading-tight line-clamp-2 text-black group-hover:text-black/80 transition-colors">
            {name}
          </div>
          <div className="text-xs md:text-sm text-gray-800">{price}</div>
        </div>
        {colors.length > 0 && (
          <div className="flex gap-2 mt-1">
            {colors.map((c, i) => (
              <ColorSwatch
                key={i}
                color={c.color}
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
