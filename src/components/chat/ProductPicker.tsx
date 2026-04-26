"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Search, Loader2, ChevronDown, ChevronUp, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { productService } from "@/services/product";
import type { ProductDto, ProductVariantWithMediaEntity } from "@/dto/product";
import type { ProductAttachment } from "@/utils/chat-product";

const VND = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const PER_PAGE = 20;

interface ProductPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (att: ProductAttachment) => void;
  accessToken: string;
}

export default function ProductPicker({ open, onClose, onSelect, accessToken }: ProductPickerProps) {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

  const fetchProducts = useCallback(async (page: number, append: boolean) => {
    if (!accessToken) return;
    if (page === 1) setLoading(true);
    try {
      const res = await productService.getAllProducts({ page, perPage: PER_PAGE, accessToken });
      const data = Array.isArray(res?.data) ? res.data : [];
      if (append) setProducts((prev) => [...prev, ...data]);
      else setProducts(data);
      setHasMore(data.length === PER_PAGE);
    } catch {
      if (!append) setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!open) return;
    pageRef.current = 1;
    setSearch("");
    setExpandedId(null);
    setSelectedVariantId(null);
    fetchProducts(1, false);
  }, [open, fetchProducts]);

  const loadMore = () => {
    if (!hasMore || loading) return;
    const next = pageRef.current + 1;
    pageRef.current = next;
    fetchProducts(next, true);
  };

  const filtered = search.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()))
    : products;

  const handleConfirm = (product: ProductDto, variant?: ProductVariantWithMediaEntity) => {
    const imageUrl =
      (variant?.media?.[0]?.url) ??
      product.media?.[0]?.url ??
      "";
    const price = variant?.price ?? product.price;
    onSelect({
      productId: product.id,
      productName: product.name,
      price,
      imageUrl,
      variantId: variant?.id,
      variantSize: variant?.variantSize,
      variantColor: variant?.variantColor,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md w-full p-0 gap-0 flex flex-col max-h-[80vh]">
        <DialogHeader className="px-4 py-3 border-b flex-shrink-0">
          <DialogTitle className="text-sm font-semibold">Chọn sản phẩm để gửi</DialogTitle>
        </DialogHeader>

        <div className="px-4 py-2 border-b flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm sản phẩm..."
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 divide-y">
          {loading && products.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="animate-spin text-gray-400 w-6 h-6" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-gray-400">
              Không tìm thấy sản phẩm.
            </div>
          ) : (
            <>
              {filtered.map((product) => {
                const isExpanded = expandedId === product.id;
                const thumb = product.media?.[0]?.url ?? "";
                const prices = product.productVariants.map((v) => v.price);
                const minPrice = prices.length ? Math.min(...prices) : product.price;
                const maxPrice = prices.length ? Math.max(...prices) : product.price;
                const priceLabel = minPrice === maxPrice
                  ? VND.format(minPrice)
                  : `${VND.format(minPrice)} – ${VND.format(maxPrice)}`;

                return (
                  <div key={product.id}>
                    {/* Product row */}
                    <div
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        if (product.productVariants.length === 0) {
                          handleConfirm(product);
                        } else {
                          setExpandedId(isExpanded ? null : product.id);
                          setSelectedVariantId(null);
                        }
                      }}
                    >
                      <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 overflow-hidden">
                        {thumb && (
                          <Image src={thumb} alt={product.name} fill sizes="48px" className="object-cover" unoptimized />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">{priceLabel}</p>
                      </div>
                      {product.productVariants.length > 0 && (
                        isExpanded ? <ChevronUp size={14} className="text-gray-400 shrink-0" /> : <ChevronDown size={14} className="text-gray-400 shrink-0" />
                      )}
                    </div>

                    {/* Variant list */}
                    {isExpanded && product.productVariants.length > 0 && (
                      <div className="bg-gray-50 border-t divide-y">
                        {/* Send without specific variant */}
                        <div
                          className="flex items-center gap-3 px-6 py-2.5 hover:bg-white cursor-pointer"
                          onClick={() => handleConfirm(product)}
                        >
                          <div className="w-4 h-4 border border-gray-300 shrink-0" />
                          <span className="text-xs text-gray-500 italic">Không chọn phiên bản cụ thể</span>
                        </div>
                        {product.productVariants.map((v) => {
                          const variantThumb = v.media?.[0]?.url ?? thumb;
                          const isSelected = selectedVariantId === v.id;
                          return (
                            <div
                              key={v.id}
                              className={`flex items-center gap-3 px-6 py-2.5 hover:bg-white cursor-pointer ${isSelected ? "bg-white" : ""}`}
                              onClick={() => {
                                setSelectedVariantId(v.id);
                                handleConfirm(product, v);
                              }}
                            >
                              <div className="relative w-8 h-8 flex-shrink-0 bg-gray-100 overflow-hidden">
                                {variantThumb && (
                                  <Image src={variantThumb} alt="" fill sizes="32px" className="object-cover" unoptimized />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium">
                                  {[v.variantSize, v.variantColor].filter(Boolean).join(" · ")}
                                </p>
                                <p className="text-xs text-gray-500">{VND.format(v.price)}</p>
                              </div>
                              {isSelected && <Check size={14} className="text-black shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {hasMore && (
                <div className="p-3 flex justify-center">
                  <Button variant="ghost" size="sm" onClick={loadMore} disabled={loading} className="text-xs cursor-pointer">
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Tải thêm"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
