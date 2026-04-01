"use client";

import { useState, useMemo, useCallback } from "react";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import type { ProductVariantWithMediaEntity } from "@/dto/product";
import type { ProductVariantEntity } from "@/dto/product-variant";
import type { ColorEntity } from "@/dto/color";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80";

interface ProductDetailClientProps {
  brand: string;
  name: string;
  rating: number;
  reviewCount: number;
  basePrice: number;
  baseStock: number;
  /** Variants with media (from product response) — used for gallery images */
  variantsWithMedia: ProductVariantWithMediaEntity[];
  /** Variants without media (from separate endpoint) — used for ProductInfo logic */
  variants: ProductVariantEntity[];
  colors: ColorEntity[];
}

/** Get gallery images for a given colorId from variants with media */
function getImagesForColor(
  variantsWithMedia: ProductVariantWithMediaEntity[],
  colorId: number
): string[] {
  // Find all variants matching this color, collect their media
  const images: string[] = [];
  for (const v of variantsWithMedia) {
    if (v.colorId === colorId && v.media?.length > 0) {
      for (const m of v.media) {
        if (m.type === "IMAGE" && !images.includes(m.url)) {
          images.push(m.url);
        }
      }
      // Only need images from one size (they're duplicated across sizes)
      break;
    }
  }
  return images.length > 0 ? images : [PLACEHOLDER_IMAGE];
}

export default function ProductDetailClient({
  brand,
  name,
  rating,
  reviewCount,
  basePrice,
  baseStock,
  variantsWithMedia,
  variants,
  colors,
}: ProductDetailClientProps) {
  // Default to first color found in variants
  const defaultColorId = variantsWithMedia[0]?.colorId ?? 0;
  const [selectedColorId, setSelectedColorId] = useState(defaultColorId);

  const galleryImages = useMemo(
    () => getImagesForColor(variantsWithMedia, selectedColorId),
    [variantsWithMedia, selectedColorId]
  );

  const handleColorChange = useCallback((colorId: number) => {
    setSelectedColorId(colorId);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      <ProductGallery images={galleryImages} />
      <ProductInfo
        brand={brand}
        name={name}
        rating={rating}
        reviewCount={reviewCount}
        basePrice={basePrice}
        viewersCount={0}
        baseStock={baseStock}
        variants={variants}
        colors={colors}
        onColorChange={handleColorChange}
      />
    </div>
  );
}
