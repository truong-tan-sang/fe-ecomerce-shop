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
      className="relative w-full overflow-visible bg-white flex flex-col group cursor-pointer transition-all duration-500 border border-black/10 hover:border-black"
      style={{
        boxShadow: "0 4px 16px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.04), inset 0 -1px 0 rgba(0,0,0,0.04)",
        transform: "translateZ(0)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.16), 0 20px 60px rgba(0,0,0,0.08), inset 0 -2px 0 rgba(0,0,0,0.1), 0 0 0 2px black";
        e.currentTarget.style.transform = "translateY(-4px) translateZ(0)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.04), inset 0 -1px 0 rgba(0,0,0,0.04)";
        e.currentTarget.style.transform = "translateY(0) translateZ(0)";
      }}
    >
      {/* Corner accents - game UI style */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-black opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-black opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-black opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-black opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

      {/* Floating shapes */}
      <div className="absolute top-2 right-2 w-2 h-2 rotate-45 bg-black/5 group-hover:bg-black/20 pointer-events-none transition-all duration-700 group-hover:translate-x-1 group-hover:-translate-y-1" />
      <div className="absolute top-8 right-4 w-1.5 h-1.5 bg-black/5 group-hover:bg-black/15 pointer-events-none transition-all duration-500 group-hover:translate-x-2 group-hover:translate-y-1" 
        style={{ clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)" }} 
      />
      <div className="absolute bottom-20 left-2 w-2 h-2 bg-black/5 group-hover:bg-black/15 pointer-events-none transition-all duration-900 group-hover:-translate-x-1 group-hover:translate-y-2" 
        style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
      />

      {/* Image (top) */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
        {/* Scan line effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div 
            className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{
              animation: "scan 3s linear infinite",
              top: "0",
            }}
          />
        </div>
        
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-90"
          sizes="256px"
        />
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/0 via-black/0 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Grid overlay effect */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(0deg, transparent 24%, black 25%, black 26%, transparent 27%, transparent 74%, black 75%, black 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, black 25%, black 26%, transparent 27%, transparent 74%, black 75%, black 76%, transparent 77%, transparent)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="absolute top-2 left-2 flex flex-wrap gap-2 text-[11px] font-medium z-10">
          <span
            className={`px-2 py-1 border backdrop-blur-sm transition-all duration-300 ${
              inStock 
                ? "bg-white/90 text-black border-black/20 group-hover:bg-white group-hover:border-black/40" 
                : "bg-gray-100/90 text-gray-600 border-black/10"
            }`}
          >
            {inStock ? stockLabel : "Hết hàng"}
          </span>
          {variantsLabel && (
            <span className="px-2 py-1 border backdrop-blur-sm bg-white/90 text-black border-black/15 group-hover:bg-white group-hover:border-black/30 transition-all duration-300">
              {variantsLabel}
            </span>
          )}
        </div>

        {/* Quick add overlay with enhanced styling */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-all duration-300 z-10">
          <button
            type="button"
            className="relative w-full bg-black text-white text-xs font-medium px-3 py-2 flex items-center justify-center gap-2 cursor-pointer overflow-hidden group/btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickAdd?.();
            }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
            <span className="relative z-10">Thêm vào giỏ</span>
            <span aria-hidden className="relative z-10 transition-transform group-hover/btn:translate-x-1 duration-300">→</span>
          </button>
        </div>
      </div>

      {/* Info (bottom) with enhanced styling */}
      <div className="relative flex-1 flex flex-col gap-2 p-3 justify-between bg-gradient-to-b from-white to-gray-50/30">
        {/* Subtle tech lines */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        
        <div className="space-y-1">
          <div className="text-sm md:text-base font-bold leading-tight line-clamp-2 text-black group-hover:text-black transition-colors duration-300">
            {name}
          </div>
          <div className="text-xs md:text-sm text-gray-800 font-medium">{price}</div>
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

      <style jsx>{`
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>
    </Link>
  );
}
