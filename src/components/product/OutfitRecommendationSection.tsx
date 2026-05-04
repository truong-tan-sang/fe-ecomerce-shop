"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import { recommendationService } from "@/services/recommendation";
import { productService } from "@/services/product";
import { colorService } from "@/services/color";
import type { ProductDto } from "@/dto/product";
import type { ColorEntity } from "@/dto/color";

interface Props {
  variantId: number;
}

export default function OutfitRecommendationSection({ variantId }: Props) {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [colors, setColors] = useState<ColorEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [recRes, colorRes] = await Promise.all([
          recommendationService.getOutfitRecommendation(variantId),
          colorService.getAllColors(),
        ]);

        if (cancelled) return;

        const recommendedVariants = recRes?.data ?? [];
        setColors(colorRes?.data ?? []);

        if (recommendedVariants.length === 0) {
          setLoading(false);
          return;
        }

        const productResults = await Promise.all(
          recommendedVariants.map((v) =>
            productService.getProductById(String(v.productId))
          )
        );

        if (!cancelled) {
          setProducts(
            productResults.map((r) => r?.data).filter((p): p is ProductDto => !!p)
          );
        }
      } catch (err) {
        console.error("[OutfitRecommendationSection] Failed to load:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [variantId]);

  if (loading) {
    return (
      <section className="mt-12">
        <h2 className="text-xl font-bold mb-6 uppercase tracking-wide">Gợi ý phối đồ</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 aspect-[4/3]" />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold mb-6 uppercase tracking-wide">Gợi ý phối đồ</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={String(product.id)}
            name={product.name}
            stock={product.stock}
            productImageUrl={product.media?.[0]?.url ?? ""}
            variants={product.productVariants ?? []}
            colors={colors}
          />
        ))}
      </div>
    </section>
  );
}
