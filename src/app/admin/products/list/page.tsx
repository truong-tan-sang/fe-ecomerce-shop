"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Search,
  SlidersHorizontal,
  PlusSquare,
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  X,
  Filter,
  Loader2,
} from "lucide-react";
import { productService } from "@/services/product";
import { categoryService } from "@/services/category";
import type { ProductDto } from "@/dto/product";
import type { CategoryDto } from "@/dto/category";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FilterTab = "all" | "on_sale" | "out_of_stock";

const ROW_HEIGHT = 57; // px per table row
const PER_PAGE = 20;

export default function AdminProductsListPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = session?.user?.access_token || "";

  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Track current page for infinite scroll
  const pageRef = useRef(1);

  // Category filter state — initialize from URL param if present
  const urlCategoryId = searchParams.get("categoryId");
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(
    urlCategoryId ? parseInt(urlCategoryId) : null
  );

  // Add category dialog state
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [categorySaving, setCategorySaving] = useState(false);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  // --- Data fetching ---

  const fetchProducts = useCallback(
    async (page: number, append: boolean) => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        console.log("[ProductList] Fetching products page:", page);
        const res = await productService.getAllProducts({
          page,
          perPage: PER_PAGE,
          accessToken,
        });
        console.log("[ProductList] Products response:", res);
        const data = res.data ?? [];

        if (append) {
          setProducts((prev) => [...prev, ...data]);
        } else {
          setProducts(data);
        }

        setHasMore(data.length >= PER_PAGE);
      } catch (err) {
        console.log("[ProductList] Error fetching products:", err);
        if (!append) setProducts([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [accessToken]
  );

  const fetchProductsByCategory = useCallback(
    async (categoryId: number) => {
      setLoading(true);
      try {
        console.log("[ProductList] Fetching products for category:", categoryId);
        const res = await categoryService.getProductsByCategory(
          categoryId,
          { page: 1, perPage: 100 },
          accessToken
        );
        console.log("[ProductList] Category products response:", res);
        setProducts(res.data ?? []);
        setHasMore(false); // category view loads all at once
      } catch (err) {
        console.log("[ProductList] Error fetching category products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  const fetchCategories = useCallback(async () => {
    try {
      console.log("[ProductList] Fetching categories");
      const res = await categoryService.getAllCategories(accessToken);
      console.log("[ProductList] Categories response:", res);
      setCategories(res.data ?? []);
    } catch (err) {
      console.log("[ProductList] Error fetching categories:", err);
      setCategories([]);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      fetchCategories();
    }
  }, [accessToken, fetchCategories]);

  useEffect(() => {
    if (!accessToken) return;
    pageRef.current = 1;
    if (activeCategoryId !== null) {
      fetchProductsByCategory(activeCategoryId);
    } else {
      fetchProducts(1, false);
    }
  }, [accessToken, activeCategoryId, fetchProducts, fetchProductsByCategory]);

  const loadNextPage = useCallback(() => {
    if (loadingMore || !hasMore || activeCategoryId !== null) return;
    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;
    fetchProducts(nextPage, true);
  }, [loadingMore, hasMore, activeCategoryId, fetchProducts]);

  // --- Handlers ---

  const handleCategoryClick = (categoryId: number) => {
    if (activeCategoryId === categoryId) {
      setActiveCategoryId(null);
    } else {
      setActiveCategoryId(categoryId);
    }
  };

  const clearCategoryFilter = () => {
    setActiveCategoryId(null);
  };

  const handleDelete = async (id: number) => {
    try {
      console.log("[ProductList] Deleting product:", id);
      await productService.deleteProduct(id, accessToken);
      setDeleteConfirmId(null);
      // Remove from local state instead of refetching everything
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.log("[ProductList] Error deleting product:", err);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !session?.user?.id) return;
    setCategorySaving(true);
    try {
      const now = new Date().toISOString();
      await categoryService.createCategory(
        {
          name: newCategoryName.trim(),
          description: newCategoryDesc.trim() || newCategoryName.trim(),
          parentId: 0,
          createByUserId: parseInt(session.user.id),
          voucherId: 0,
          createdAt: now,
          updatedAt: now,
        },
        accessToken
      );
      setAddCategoryOpen(false);
      setNewCategoryName("");
      setNewCategoryDesc("");
      await fetchCategories();
    } catch (err) {
      console.error("[ProductList] Error creating category:", err);
      alert("Tạo danh mục thất bại");
    } finally {
      setCategorySaving(false);
    }
  };

  // --- Derived data ---

  const getCategoryName = (categoryId: number | null): string => {
    if (!categoryId) return "--";
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.name ?? "--";
  };

  const getProductImage = (product: ProductDto): string | null => {
    if (product.media && product.media.length > 0) {
      return product.media[0].url;
    }
    if (
      product.productVariants &&
      product.productVariants.length > 0 &&
      product.productVariants[0].media &&
      product.productVariants[0].media.length > 0
    ) {
      return product.productVariants[0].media[0].url;
    }
    return null;
  };

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const filteredProducts = products.filter((p) => {
    if (activeTab === "out_of_stock") return p.stock === 0;
    if (activeTab === "on_sale") return p.voucherId !== null;
    return true;
  });

  const searchedProducts = searchQuery
    ? filteredProducts.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredProducts;

  const activeCategoryName = activeCategoryId
    ? categories.find((c) => c.id === activeCategoryId)?.name
    : null;

  // --- Virtualizer ---

  const rowVirtualizer = useVirtualizer({
    count: searchedProducts.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  // Infinite scroll — trigger when last virtual item is visible
  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems();
    if (virtualItems.length === 0) return;
    const lastItem = virtualItems[virtualItems.length - 1];
    if (
      lastItem.index >= searchedProducts.length - 5 &&
      hasMore &&
      !loadingMore &&
      !loading &&
      activeCategoryId === null &&
      !searchQuery
    ) {
      loadNextPage();
    }
  }, [
    rowVirtualizer.getVirtualItems(),
    searchedProducts.length,
    hasMore,
    loadingMore,
    loading,
    activeCategoryId,
    searchQuery,
    loadNextPage,
  ]);

  return (
    <div className="h-screen bg-[#f9fafb] p-6 flex flex-col overflow-hidden">
      {/* Delete Confirmation Dialog */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-[#023337] mb-2">
              Xác nhận xóa
            </h3>
            <p className="text-gray-600 mb-4">
              Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể
              hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h1 className="text-2xl font-bold text-[#151515]">Danh mục</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/products/add")}
            className="flex items-center gap-2 bg-[#4ea674] text-white px-4 py-2 font-medium hover:bg-[#3d8a5f] cursor-pointer"
          >
            <PlusSquare size={18} />
            Thêm sản phẩm
          </button>
          <button className="flex items-center gap-2 border border-gray-300 px-4 py-2 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
            Hành động khác
          </button>
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex items-center gap-2 mb-3 flex-shrink-0 overflow-x-auto pb-1">
        <button
          onClick={() => setAddCategoryOpen(true)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-gray-300 bg-white text-gray-400 text-sm hover:border-[#4ea674] hover:text-[#4ea674] cursor-pointer transition-colors"
        >
          <Plus size={14} />
          Thêm
        </button>

        {activeCategoryId !== null && (
          <button
            onClick={clearCategoryFilter}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-500 text-sm cursor-pointer hover:bg-gray-200 transition-colors"
          >
            <X size={12} />
            Bỏ lọc
          </button>
        )}

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`flex-shrink-0 px-3 py-1.5 text-sm font-medium cursor-pointer transition-all ${
              activeCategoryId === cat.id
                ? "bg-[#4ea674] text-white shadow-sm"
                : "bg-white text-[#023337] border border-gray-200 hover:border-[#4ea674] hover:text-[#4ea674]"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Table Card */}
      <div className="bg-white shadow flex flex-col flex-1 min-h-0">
        {/* Filter Tabs and Search */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 flex-shrink-0">
          {/* Filter Tabs */}
          <div className="flex items-center bg-[#eaf8e7] p-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors ${
                activeTab === "all"
                  ? "bg-white text-[#023337] shadow-sm"
                  : "text-[#023337] hover:bg-white/50"
              }`}
            >
              Tất cả sản phẩm{" "}
              <span className="text-[#4ea674] font-semibold">
                ({products.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab("on_sale")}
              className={`px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors ${
                activeTab === "on_sale"
                  ? "bg-white text-[#023337] shadow-sm"
                  : "text-[#023337] hover:bg-white/50"
              }`}
            >
              Đang giảm giá
            </button>
            <button
              onClick={() => setActiveTab("out_of_stock")}
              className={`px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors ${
                activeTab === "out_of_stock"
                  ? "bg-white text-[#023337] shadow-sm"
                  : "text-[#023337] hover:bg-white/50"
              }`}
            >
              Hết hàng
            </button>
          </div>

          {/* Search and Icons */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 bg-gray-100 text-sm outline-none focus:ring-1 focus:ring-[#4ea674] w-56"
              />
            </div>
            <button className="p-2 hover:bg-gray-100 cursor-pointer">
              <SlidersHorizontal size={18} className="text-gray-500" />
            </button>
            <button
              onClick={() => router.push("/admin/products/add")}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              <PlusSquare size={18} className="text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 cursor-pointer">
              <MoreHorizontal size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Table Header */}
        <div
          className="grid bg-[#eaf8e7] flex-shrink-0"
          style={{ gridTemplateColumns: "60px 1fr 160px 128px 112px 112px" }}
        >
          <div className="px-4 py-3 text-sm font-semibold text-[#023337]">STT</div>
          <div className="px-4 py-3 text-sm font-semibold text-[#023337]">Sản phẩm</div>
          <div className="px-4 py-3 text-sm font-semibold text-[#023337]">
            <div className="flex items-center gap-1">
              Danh mục
              {activeCategoryId !== null ? (
                <button
                  onClick={clearCategoryFilter}
                  className="p-0.5 hover:bg-white/50 cursor-pointer"
                  title="Xóa bộ lọc danh mục"
                >
                  <Filter size={14} className="text-[#4ea674]" />
                </button>
              ) : (
                <Filter size={14} className="text-gray-400" />
              )}
            </div>
          </div>
          <div className="px-4 py-3 text-sm font-semibold text-[#023337]">Ngày thêm</div>
          <div className="px-4 py-3 text-sm font-semibold text-[#023337]">Số đơn hàng</div>
          <div className="px-4 py-3 text-sm font-semibold text-[#023337]">Hành động</div>
        </div>

        {/* Virtualized scrollable body */}
        <div
          ref={tableContainerRef}
          className="overflow-auto flex-1 min-h-0"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
              Đang tải...
            </div>
          ) : searchedProducts.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
              Không tìm thấy sản phẩm nào
            </div>
          ) : (
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const product = searchedProducts[virtualRow.index];
                const imgUrl = getProductImage(product);
                return (
                  <div
                    key={product.id}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    onClick={() =>
                      router.push(`/admin/products/edit/${product.id}`)
                    }
                    className="grid border-t border-gray-100 hover:bg-gray-50 cursor-pointer items-center"
                    style={{
                      gridTemplateColumns: "60px 1fr 160px 128px 112px 112px",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <div className="px-4 py-3 text-sm text-black">
                      {virtualRow.index + 1}
                    </div>
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border border-gray-200 bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200" />
                          )}
                        </div>
                        <span className="text-sm text-black font-medium truncate">
                          {product.name}
                        </span>
                      </div>
                    </div>
                    <div className="px-4 py-3 text-sm text-black">
                      {getCategoryName(product.categoryId)}
                    </div>
                    <div className="px-4 py-3 text-sm text-black">
                      {formatDate(product.createdAt)}
                    </div>
                    <div className="px-4 py-3 text-sm text-black">0</div>
                    <div
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            router.push(`/admin/products/edit/${product.id}`)
                          }
                          className="p-1.5 hover:bg-gray-100 cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Pencil size={16} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(product.id)}
                          className="p-1.5 hover:bg-red-50 cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Loading more indicator */}
          {loadingMore && (
            <div className="flex items-center justify-center py-4 gap-2 text-gray-400 text-sm">
              <Loader2 size={16} className="animate-spin" />
              Đang tải thêm...
            </div>
          )}
        </div>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Thêm danh mục mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Tên danh mục
              </label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="VD: Áo thun, Giày dép, ..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Mô tả
              </label>
              <Input
                value={newCategoryDesc}
                onChange={(e) => setNewCategoryDesc(e.target.value)}
                placeholder="Mô tả ngắn về danh mục"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddCategoryOpen(false)}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleAddCategory}
              disabled={categorySaving || !newCategoryName.trim()}
              className="bg-[#4ea674] hover:bg-[#3d8a5f] text-white cursor-pointer"
            >
              {categorySaving ? "Đang tạo..." : "Tạo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
