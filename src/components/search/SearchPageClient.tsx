"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import type { CategoryDto } from "@/dto/category";
import type { ColorEntity } from "@/dto/color";
import type { ProductVariantWithMediaEntity } from "@/dto/product";

interface SearchProduct {
  variantId: number;
  id: number;
  name: string;
  stock: number;
  productImageUrl: string;
  variants: ProductVariantWithMediaEntity[];
}

interface SearchPageClientProps {
  categories: CategoryDto[];
  colors: ColorEntity[];
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const CONDITIONS = [
  { value: "new", label: "Mới" },
  { value: "best_selling", label: "Bán chạy" },
  { value: "used", label: "Đã dùng" },
];
const PER_PAGE = 20;

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-200 pb-4">
      <p className="text-sm font-bold uppercase tracking-wider text-black mb-3">{title}</p>
      {children}
    </div>
  );
}

export default function SearchPageClient({ categories, colors }: SearchPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // ── Filter state (initialised from URL) ──────────────────────────────────
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : null
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(
    searchParams.getAll("colors")
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    searchParams.getAll("sizes")
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [pendingMin, setPendingMin] = useState(searchParams.get("minPrice") || "");
  const [pendingMax, setPendingMax] = useState(searchParams.get("maxPrice") || "");
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    searchParams.getAll("conditions")
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ── Product grid state ────────────────────────────────────────────────────
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  const q = searchParams.get("q") ?? "";

  // ── Build fetch URL from current filter state ─────────────────────────────
  const buildApiUrl = useCallback(
    (pg: number) => {
      const params = new URLSearchParams();
      params.set("page", String(pg));
      params.set("perPage", String(PER_PAGE));
      if (q) params.set("q", q);
      if (selectedCategoryId) {
        const cat = categories.find((c) => c.id === selectedCategoryId);
        if (cat) params.set("categoryName", cat.name);
      }
      selectedColors.forEach((c) => params.append("colors", c));
      selectedSizes.forEach((s) => params.append("sizes", s));
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      selectedConditions.forEach((c) => params.append("conditions", c));
      return `/api/search?${params.toString()}`;
    },
    [q, selectedCategoryId, selectedColors, selectedSizes, minPrice, maxPrice, selectedConditions, categories]
  );

  // ── Fetch first page whenever filters change ───────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setProducts([]);
    setPage(1);
    setHasMore(false);
    try {
      const token = session?.user?.access_token;
      const res = await fetch(buildApiUrl(1), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      const fetched: SearchProduct[] = Array.isArray(json?.data) ? json.data : [];
      setProducts(fetched);

      setHasMore(fetched.length === PER_PAGE);
      setPage(1);
    } catch (err) {
      console.error("[SearchPageClient] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [buildApiUrl, session]);

  // ── Load more (infinite scroll) ───────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const token = session?.user?.access_token;
      const res = await fetch(buildApiUrl(nextPage), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      const fetched: SearchProduct[] = Array.isArray(json?.data) ? json.data : [];
      setProducts((prev) => [...prev, ...fetched]);
      setHasMore(fetched.length === PER_PAGE);
      setPage(nextPage);
    } catch (err) {
      console.error("[SearchPageClient] LoadMore error:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, buildApiUrl, session]);

  // ── Intersection observer for infinite scroll ─────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingMore) loadMore();
      },
      { rootMargin: "200px", threshold: 0.1 }
    );
    const el = observerRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [hasMore, loadingMore, loadMore]);

  // ── Re-fetch when search params (q) change in URL ─────────────────────────
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, selectedCategoryId, selectedColors, selectedSizes, minPrice, maxPrice, selectedConditions]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function pushUrl() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (selectedCategoryId) params.set("categoryId", String(selectedCategoryId));
    selectedColors.forEach((c) => params.append("colors", c));
    selectedSizes.forEach((s) => params.append("sizes", s));
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    selectedConditions.forEach((c) => params.append("conditions", c));
    router.push(`/search?${params.toString()}`);
  }

  function toggleColor(colorName: string) {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  }

  function toggleSize(size: string) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }

  function toggleCondition(value: string) {
    setSelectedConditions((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  }

  function applyPrice() {
    setMinPrice(pendingMin);
    setMaxPrice(pendingMax);
  }

  function clearAll() {
    setSelectedCategoryId(null);
    setSelectedColors([]);
    setSelectedSizes([]);
    setMinPrice("");
    setMaxPrice("");
    setPendingMin("");
    setPendingMax("");
    setSelectedConditions([]);
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  const hasActiveFilters =
    selectedCategoryId !== null ||
    selectedColors.length > 0 ||
    selectedSizes.length > 0 ||
    minPrice !== "" ||
    maxPrice !== "" ||
    selectedConditions.length > 0;

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const searchForm = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const val = ((new FormData(e.currentTarget)).get("q") as string ?? "").trim();
        const params = new URLSearchParams(window.location.search);
        if (val) params.set("q", val);
        else params.delete("q");
        router.push(`/search?${params.toString()}`);
      }}
      className="flex items-stretch border border-gray-300 hover:border-black transition-colors"
    >
      <input
        name="q"
        defaultValue={q}
        key={q}
        placeholder="Tìm kiếm sản phẩm..."
        className="flex-1 px-3 py-2 text-sm outline-none bg-transparent placeholder:text-gray-400 min-w-0"
        autoComplete="off"
      />
      <button
        type="submit"
        className="px-3 bg-black text-white hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
        aria-label="Tìm kiếm"
      >
        <Search size={14} />
      </button>
    </form>
  );

  const sidebar = (
    <aside className="flex flex-col gap-4 w-56 shrink-0">
      <div className="flex items-center justify-between">
        <p className="font-bold text-base text-black">Bộ lọc</p>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-black flex items-center gap-1 cursor-pointer"
          >
            <X size={12} /> Xóa tất cả
          </button>
        )}
      </div>

      {/* Danh mục */}
      {categories.length > 0 && (
        <FilterSection title="Danh mục">
          <div className="flex flex-col gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(selectedCategoryId === cat.id ? null : cat.id)}
                className={`text-left text-sm px-2 py-1.5 transition-colors cursor-pointer ${
                  selectedCategoryId === cat.id
                    ? "bg-black text-white font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Màu sắc */}
      {colors.length > 0 && (
        <FilterSection title="Màu sắc">
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => toggleColor(color.name)}
                title={color.name}
                className={`w-7 h-7 transition-all cursor-pointer ${
                  selectedColors.includes(color.name)
                    ? "ring-2 ring-black ring-offset-1"
                    : "ring-1 ring-gray-200 hover:ring-gray-400"
                }`}
                style={{ backgroundColor: color.hexCode }}
                aria-label={color.name}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Kích thước */}
      <FilterSection title="Kích thước">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`px-3 py-1 text-sm border transition-colors cursor-pointer ${
                selectedSizes.includes(size)
                  ? "border-black bg-black text-white font-semibold"
                  : "border-gray-300 text-gray-700 hover:border-black"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Khoảng giá */}
      <FilterSection title="Khoảng giá">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Từ"
              value={pendingMin}
              onChange={(e) => setPendingMin(e.target.value)}
              className="w-full border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-black"
              min={0}
            />
            <span className="text-gray-400 shrink-0">—</span>
            <input
              type="number"
              placeholder="Đến"
              value={pendingMax}
              onChange={(e) => setPendingMax(e.target.value)}
              className="w-full border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-black"
              min={0}
            />
          </div>
          <button
            onClick={applyPrice}
            className="w-full py-1.5 text-sm bg-black text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Áp dụng
          </button>
        </div>
      </FilterSection>

      {/* Điều kiện */}
      <FilterSection title="Điều kiện">
        <div className="flex flex-col gap-2">
          {CONDITIONS.map((cond) => (
            <label key={cond.value} className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selectedConditions.includes(cond.value)}
                onChange={() => toggleCondition(cond.value)}
                className="w-4 h-4 accent-black cursor-pointer"
              />
              <span className="text-sm text-gray-700">{cond.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </aside>
  );

  return (
    <>
      {/* Page header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          {products.length > 0 && !loading && (
            <p className="text-sm text-gray-400">{products.length} kết quả{hasMore ? "+" : ""}</p>
          )}
        </div>
        {/* Mobile filter toggle */}
        <button
          onClick={() => setMobileSidebarOpen((v) => !v)}
          className="lg:hidden flex items-center gap-2 border border-gray-300 px-3 py-2 text-sm cursor-pointer hover:border-black transition-colors"
        >
          <SlidersHorizontal size={14} />
          Bộ lọc
          {hasActiveFilters && (
            <span className="w-4 h-4 bg-black text-white text-[10px] flex items-center justify-center font-bold">
              !
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-6 items-start">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex flex-col gap-4 w-56 shrink-0">
          {searchForm}
          {sidebar}
        </div>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-white p-5 overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-base">Bộ lọc</p>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="cursor-pointer hover:opacity-70"
                >
                  <X size={18} />
                </button>
              </div>
              {searchForm}
              {sidebar}
              <button
                onClick={() => { pushUrl(); setMobileSidebarOpen(false); }}
                className="w-full mt-4 py-3 bg-black text-white text-sm font-semibold cursor-pointer hover:bg-gray-800 transition-colors"
              >
                Xem kết quả
              </button>
            </div>
          </div>
        )}

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={28} className="animate-spin text-gray-400" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-gray-400 text-base">Không tìm thấy sản phẩm phù hợp</p>
              {hasActiveFilters && (
                <button
                  onClick={clearAll}
                  className="mt-4 text-sm underline text-gray-500 hover:text-black cursor-pointer"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {products.map((p) => (
                  <ProductCard
                    key={p.variantId}
                    id={String(p.id)}
                    name={p.name}
                    stock={p.stock}
                    productImageUrl={p.productImageUrl}
                    variants={p.variants}
                    colors={colors}
                    showVariantInfo
                  />
                ))}
              </div>

              {/* Infinite scroll sentinel */}
              {hasMore && (
                <div ref={observerRef} className="flex justify-center py-8">
                  {loadingMore && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Loader2 size={18} className="animate-spin" />
                      Đang tải thêm...
                    </div>
                  )}
                </div>
              )}

              {!hasMore && products.length > 0 && (
                <div className="text-center py-8 text-sm text-gray-400">
                  Đã hiển thị tất cả sản phẩm
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
