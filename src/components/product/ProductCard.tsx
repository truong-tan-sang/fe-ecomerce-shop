'use client';
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ColorSwatch from "./ColorSwatch";
import { theme } from "@/lib/theme";

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
      className="relative w-full overflow-visible bg-[var(--bg-primary)] flex flex-col group cursor-pointer transition-all duration-500 border border-[var(--border-light)] hover:border-[var(--border-primary)]"
      style={{
        boxShadow: theme.shadow.sm,
        transform: "translateZ(0)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = theme.shadow.md;
        e.currentTarget.style.transform = "translateY(-4px) translateZ(0)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = theme.shadow.sm;
        e.currentTarget.style.transform = "translateY(0) translateZ(0)";
      }}
    >
      {/* Corner accents - game UI style */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[var(--accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[var(--accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[var(--accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[var(--accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

      {/* Floating shapes */}
      <div className="absolute top-2 right-2 w-2 h-2 rotate-45 bg-[var(--ui-shape-primary)] group-hover:bg-[var(--ui-shape-hover)] pointer-events-none transition-all duration-700 group-hover:translate-x-1 group-hover:-translate-y-1" />
      <div className="absolute top-8 right-4 w-1.5 h-1.5 bg-[var(--ui-shape-primary)] group-hover:bg-[var(--ui-shape-hover)] pointer-events-none transition-all duration-500 group-hover:translate-x-2 group-hover:translate-y-1" 
        style={{ clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)" }} 
      />
      <div className="absolute bottom-20 left-2 w-2 h-2 bg-[var(--ui-shape-primary)] group-hover:bg-[var(--ui-shape-hover)] pointer-events-none transition-all duration-900 group-hover:-translate-x-1 group-hover:translate-y-2" 
        style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
      />

      {/* Image (top) */}
      <div className="relative w-full aspect-[4/3] bg-[var(--bg-tertiary)] overflow-hidden">
        {/* Scan line effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div 
            className="absolute w-full h-[2px]"
            style={{
              background: `linear-gradient(to right, transparent, ${theme.ui.scan}, transparent)`,
              animation: "scan 3s linear infinite",
              top: "0",
            }}
          />
        </div>
        
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-90 dark:group-hover:brightness-110"
          sizes="256px"
        />
        
        {/* Animated gradient overlay */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(to top, ${theme.accent.primary}/30, transparent, transparent)`,
          }}
        />
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: `linear-gradient(135deg, transparent, transparent, ${theme.accent.primary}/20)`,
          }}
        />
        
        {/* Grid overlay effect */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(0deg, transparent 24%, ${theme.text.primary} 25%, ${theme.text.primary} 26%, transparent 27%, transparent 74%, ${theme.text.primary} 75%, ${theme.text.primary} 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, ${theme.text.primary} 25%, ${theme.text.primary} 26%, transparent 27%, transparent 74%, ${theme.text.primary} 75%, ${theme.text.primary} 76%, transparent 77%, transparent)`,
            backgroundSize: "20px 20px",
          }}
        />

        <div className="absolute top-2 left-2 flex flex-wrap gap-2 text-[11px] font-medium z-10">
          <span
            className={`px-2 py-1 border backdrop-blur-sm transition-all duration-300`}
            style={{
              background: inStock ? "var(--accent-secondary)" : "var(--bg-secondary)",
              color: inStock ? "var(--accent-primary)" : "var(--text-secondary)",
              borderColor: "var(--border-light)",
            }}
          >
            {inStock ? stockLabel : "Hết hàng"}
          </span>
          {variantsLabel && (
            <span 
              className="px-2 py-1 border backdrop-blur-sm transition-all duration-300"
              style={{
                background: "var(--accent-secondary)",
                color: "var(--accent-primary)",
                borderColor: "var(--border-light)",
              }}
            >
              {variantsLabel}
            </span>
          )}
        </div>

        {/* Quick add overlay with enhanced styling - DISABLED */}
        {/* <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-all duration-300 z-10">
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
        </div> */}
      </div>

      {/* Info (bottom) with enhanced styling */}
      <div 
        className="relative flex-1 flex flex-col gap-2 p-3 justify-between"
        style={{ background: theme.gradient.info }}
      >
        {/* Subtle tech lines */}
        <div 
          className="absolute top-0 left-0 w-full h-[1px]"
          style={{
            background: `linear-gradient(to right, transparent, ${theme.border.light}, transparent)`,
          }}
        />
        
        <div className="space-y-1">
          <div 
            className="text-sm md:text-base font-bold leading-tight line-clamp-2 group-hover:opacity-80 transition-opacity duration-300"
            style={{ color: theme.text.primary }}
          >
            {name}
          </div>
          <div className="text-xs md:text-sm font-medium" style={{ color: theme.text.secondary }}>
            {price}
          </div>
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
