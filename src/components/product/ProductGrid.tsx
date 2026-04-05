"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import ProductCard from "./ProductCard";
import { ToastContainer } from "../toast";
import type { ProductDto } from "@/dto/product";
import type { ColorEntity } from "@/dto/color";

interface ProductGridProps {
  initialProducts: ProductDto[];
  initialPage: number;
  initialHasMore: boolean;
  colors: ColorEntity[];
}

export default function ProductGrid({ initialProducts, initialPage, initialHasMore, colors }: ProductGridProps) {
  const [products, setProducts] = useState<ProductDto[]>(initialProducts);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: "success" | "error" | "info" }>>([]);
  const observerRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  const pushToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const accessToken = session?.user?.access_token;
      const nextPage = page + 1;
      const perPage = 20;
      
      console.log(`[ProductGrid] Loading page ${nextPage}`);
      
      const response = await fetch(`/api/products?page=${nextPage}&perPage=${perPage}`, {
        headers: accessToken ? {
          Authorization: `Bearer ${accessToken}`,
        } : {},
      });

      if (!response.ok) {
        console.error("[ProductGrid] Failed to load more products:", response.statusText);
        return;
      }

      // Backend returns flat array in `data`. Normalize here.
      const result: { statusCode?: number; message?: string; data?: ProductDto[] } = await response.json();

      const fetched = Array.isArray(result?.data) ? result.data : [];
      setProducts((prev) => [...prev, ...fetched]);
      setPage(nextPage);
      const nextHasMore = fetched.length === perPage;
      setHasMore(nextHasMore);
      console.log(`[ProductGrid] Loaded ${fetched.length} products, hasMore: ${nextHasMore}`);
    } catch (error) {
      console.error("[ProductGrid] Error loading more products:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, session]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target?.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "200px", // Start loading 200px before reaching the sentinel
        threshold: 0.1,
      }
    );

    const currentObserver = observerRef.current;
    if (currentObserver) {
      observer.observe(currentObserver);
    }

    return () => {
      if (currentObserver) {
        observer.unobserve(currentObserver);
      }
    };
  }, [hasMore, loading, loadMore]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-2">
        {products.length > 0 ? (
          products.map((product) => (
              <ProductCard
                key={product.id}
                id={String(product.id)}
                name={product.name}
                stock={product.stock}
                productImageUrl={product.media?.[0]?.url ?? ""}
                variants={product.productVariants ?? []}
                colors={colors}
              />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            Không có sản phẩm nào để hiển thị
          </div>
        )}
      </div>

      {/* Intersection Observer Sentinel */}
      {hasMore && (
        <div ref={observerRef} className="col-span-full flex justify-center py-8">
          {loading && (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              <span>Đang tải thêm sản phẩm...</span>
            </div>
          )}
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="col-span-full text-center py-8 text-gray-500">
          Đã hiển thị tất cả sản phẩm
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
