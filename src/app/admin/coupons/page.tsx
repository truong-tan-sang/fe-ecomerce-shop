"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Search, PlusSquare, Pencil, Trash2, Loader2, SlidersHorizontal, X } from "lucide-react";
import { voucherService } from "@/services/voucher";
import type { VoucherDto, CreateVoucherDto, DiscountType, SearchVoucherParams } from "@/dto/voucher";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const ROW_HEIGHT = 53;
const PER_PAGE = 50;
const COLS = "48px 140px 1fr 180px 120px 100px 100px 100px 96px";

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const toInputDate = (dateStr: string) => new Date(dateStr).toISOString().slice(0, 10);

type DialogMode = "create" | "edit";

interface FormState {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  validFrom: string;
  validTo: string;
  usageLimit: string;
  isActive: boolean;
}

interface FilterState {
  discountType: DiscountType | "";
  isActive: "all" | "active" | "inactive";
}

const emptyForm = (): FormState => ({
  code: "",
  description: "",
  discountType: "FIXED_AMOUNT",
  discountValue: "",
  validFrom: "",
  validTo: "",
  usageLimit: "",
  isActive: true,
});

const emptyFilter = (): FilterState => ({
  discountType: "",
  isActive: "all",
});

const filterToParams = (search: string, filter: FilterState): SearchVoucherParams => {
  const params: SearchVoucherParams = {};
  if (search.trim()) params.code = search.trim();
  if (filter.discountType) params.discountType = filter.discountType;
  if (filter.isActive === "active") params.isActive = true;
  if (filter.isActive === "inactive") params.isActive = false;
  return params;
};

const hasActiveFilters = (filter: FilterState) =>
  filter.discountType !== "" || filter.isActive !== "all";

export default function AdminCouponsPage() {
  const { data: session } = useSession();
  const accessToken = session?.user?.access_token || "";

  const [vouchers, setVouchers] = useState<VoucherDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);

  // Search
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filters
  const [filterOpen, setFilterOpen] = useState(false);
  const [pendingFilter, setPendingFilter] = useState<FilterState>(emptyFilter());
  const [appliedFilter, setAppliedFilter] = useState<FilterState>(emptyFilter());
  const filterPanelRef = useRef<HTMLDivElement>(null);

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  // --- Data fetching ---
  const fetchVouchers = useCallback(async (page: number, append: boolean, search: string, filter: FilterState) => {
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    const params = filterToParams(search, filter);
    try {
      console.log("[CouponsPage] Searching vouchers page:", page, params);
      const res = await voucherService.searchVouchers(params, page, PER_PAGE);
      const data = Array.isArray(res.data) ? res.data : [];
      console.log("[CouponsPage] Search response:", data.length, "items");

      if (append) {
        setVouchers((prev) => [...prev, ...data]);
      } else {
        setVouchers(data);
      }

      setHasMore(data.length > 0);
    } catch (err) {
      console.error("[CouponsPage] Error fetching vouchers:", err);
      if (!append) setVouchers([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    pageRef.current = 1;
    fetchVouchers(1, false, appliedSearch, appliedFilter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchVouchers]);

  // Re-fetch when applied search/filter changes
  const triggerNewSearch = useCallback((search: string, filter: FilterState) => {
    pageRef.current = 1;
    fetchVouchers(1, false, search, filter);
  }, [fetchVouchers]);

  const loadNextPage = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;
    fetchVouchers(nextPage, true, appliedSearch, appliedFilter);
  }, [loadingMore, hasMore, fetchVouchers, appliedSearch, appliedFilter]);

  // Search debounce
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setAppliedSearch(value);
      triggerNewSearch(value, appliedFilter);
    }, 400);
  };

  const clearSearch = () => {
    setSearchInput("");
    setAppliedSearch("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    triggerNewSearch("", appliedFilter);
  };

  // Filter panel apply/reset
  const applyFilters = () => {
    setAppliedFilter(pendingFilter);
    setFilterOpen(false);
    triggerNewSearch(appliedSearch, pendingFilter);
  };

  const resetFilters = () => {
    const empty = emptyFilter();
    setPendingFilter(empty);
    setAppliedFilter(empty);
    setFilterOpen(false);
    triggerNewSearch(appliedSearch, empty);
  };

  // Close filter panel on outside click
  useEffect(() => {
    if (!filterOpen) return;
    const handler = (e: MouseEvent) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterOpen]);

  // --- Virtualizer ---
  const rowVirtualizer = useVirtualizer({
    count: vouchers.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  // Infinite scroll
  useEffect(() => {
    if (!hasMore || loadingMore || loading) return;

    const virtualItems = rowVirtualizer.getVirtualItems();
    const lastVisible = virtualItems[virtualItems.length - 1];

    const nearEnd = lastVisible
      ? lastVisible.index >= vouchers.length - 5
      : vouchers.length > 0;

    if (nearEnd) loadNextPage();
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    rowVirtualizer.getVirtualItems(),
    vouchers.length,
    hasMore,
    loadingMore,
    loading,
    loadNextPage,
  ]);

  // --- Dialog helpers ---
  const openCreate = () => {
    setDialogMode("create");
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (v: VoucherDto) => {
    setDialogMode("edit");
    setEditingId(v.id);
    setForm({
      code: v.code,
      description: v.description ?? "",
      discountType: v.discountType,
      discountValue: String(v.discountValue),
      validFrom: toInputDate(v.validFrom),
      validTo: toInputDate(v.validTo),
      usageLimit: v.usageLimit != null ? String(v.usageLimit) : "",
      isActive: v.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.discountValue || !form.validFrom || !form.validTo) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }
    if (!session?.user?.id) return;
    setSaving(true);
    try {
      if (dialogMode === "create") {
        const payload: CreateVoucherDto = {
          code: form.code.trim(),
          description: form.description.trim() || undefined,
          discountType: form.discountType,
          discountValue: parseFloat(form.discountValue),
          validFrom: new Date(form.validFrom).toISOString(),
          validTo: new Date(form.validTo).toISOString(),
          usageLimit: form.usageLimit ? parseInt(form.usageLimit) : undefined,
          timesUsed: 0,
          isActive: form.isActive,
          createdBy: parseInt(session.user.id),
        };
        const res = await voucherService.createVoucher(payload, accessToken);
        if (res.data) setVouchers((prev) => [res.data!, ...prev]);
      } else if (editingId !== null) {
        const payload = {
          code: form.code.trim(),
          description: form.description.trim() || undefined,
          discountType: form.discountType,
          discountValue: parseFloat(form.discountValue),
          validFrom: new Date(form.validFrom).toISOString(),
          validTo: new Date(form.validTo).toISOString(),
          usageLimit: form.usageLimit ? parseInt(form.usageLimit) : undefined,
          isActive: form.isActive,
        };
        const res = await voucherService.updateVoucher(editingId, payload, accessToken);
        if (res.data) setVouchers((prev) => prev.map((v) => (v.id === editingId ? res.data! : v)));
      }
      setDialogOpen(false);
    } catch (err) {
      console.error("[CouponsPage] Save error:", err);
      alert("Lưu voucher thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await voucherService.deleteVoucher(id, accessToken);
      setVouchers((prev) => prev.filter((v) => v.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error("[CouponsPage] Delete error:", err);
      alert("Xóa voucher thất bại.");
    }
  };

  const activeFilterCount =
    (appliedFilter.discountType !== "" ? 1 : 0) +
    (appliedFilter.isActive !== "all" ? 1 : 0);

  return (
    <div className="h-full p-6 flex flex-col">
      {/* Delete Confirmation */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-[#023337] mb-2">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-4">Bạn có chắc chắn muốn xóa voucher này?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer">Hủy</button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md cursor-pointer">Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-[#151515]">Voucher</h1>
        <Button onClick={openCreate} className="flex items-center gap-2 cursor-pointer">
          <PlusSquare size={18} />
          Thêm voucher
        </Button>
      </div>

      {/* Table Card */}
      <div className="bg-white shadow rounded-lg flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Search + Filter bar */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-2 flex-shrink-0">
          {/* Search input */}
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm mã voucher..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-8 py-2 bg-gray-100 text-sm outline-none focus:ring-1 focus:ring-[var(--admin-green-mid)] rounded-md w-full"
            />
            {searchInput && (
              <button onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter button + popover */}
          <div className="relative" ref={filterPanelRef}>
            <Button
              variant={activeFilterCount > 0 ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setPendingFilter(appliedFilter);
                setFilterOpen((o) => !o);
              }}
              className="gap-2 cursor-pointer"
            >
              <SlidersHorizontal size={15} />
              Bộ lọc
              {activeFilterCount > 0 && (
                <span className="bg-white/20 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 shadow-lg rounded-lg z-30 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Bộ lọc</p>

                {/* Discount type */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1.5">Loại giảm giá</p>
                  <div className="flex gap-2 flex-wrap">
                    {([["", "Tất cả"], ["FIXED_AMOUNT", "Số tiền"], ["PERCENTAGE", "Phần trăm"]] as const).map(([val, label]) => (
                      <Button
                        key={val}
                        size="sm"
                        variant={pendingFilter.discountType === val ? "default" : "outline"}
                        onClick={() => setPendingFilter((f) => ({ ...f, discountType: val as FilterState["discountType"] }))}
                        className="cursor-pointer"
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1.5">Trạng thái</p>
                  <div className="flex gap-2 flex-wrap">
                    {([["all", "Tất cả"], ["active", "Còn hiệu lực"], ["inactive", "Hết hiệu lực"]] as const).map(([val, label]) => (
                      <Button
                        key={val}
                        size="sm"
                        variant={pendingFilter.isActive === val ? "default" : "outline"}
                        onClick={() => setPendingFilter((f) => ({ ...f, isActive: val }))}
                        className="cursor-pointer"
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Button variant="outline" size="sm" onClick={resetFilters} className="flex-1 cursor-pointer">
                    Đặt lại
                  </Button>
                  <Button size="sm" onClick={applyFilters} className="flex-1 cursor-pointer">
                    Áp dụng
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Active filter chips */}
          {hasActiveFilters(appliedFilter) && (
            <div className="flex items-center gap-1.5 flex-wrap ml-1">
              {appliedFilter.discountType && (
                <span className="flex items-center gap-1 bg-[var(--admin-green-light)] text-[var(--admin-green-dark)] text-xs px-2 py-0.5 font-medium rounded-md">
                  {appliedFilter.discountType === "PERCENTAGE" ? "Phần trăm" : "Số tiền"}
                  <button onClick={() => { const f = { ...appliedFilter, discountType: "" as const }; setAppliedFilter(f); triggerNewSearch(appliedSearch, f); }} className="cursor-pointer hover:text-red-500"><X size={11} /></button>
                </span>
              )}
              {appliedFilter.isActive !== "all" && (
                <span className="flex items-center gap-1 bg-[var(--admin-green-light)] text-[var(--admin-green-dark)] text-xs px-2 py-0.5 font-medium rounded-md">
                  {appliedFilter.isActive === "active" ? "Còn hiệu lực" : "Hết hiệu lực"}
                  <button onClick={() => { const f = { ...appliedFilter, isActive: "all" as const }; setAppliedFilter(f); triggerNewSearch(appliedSearch, f); }} className="cursor-pointer hover:text-red-500"><X size={11} /></button>
                </span>
              )}
            </div>
          )}

          {/* Result count */}
          <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
            {loading ? "..." : `${vouchers.length} voucher${hasMore ? "+" : ""}`}
          </span>
        </div>

        {/* Table Header */}
        <div className="grid bg-[#eaf8e7] flex-shrink-0 text-sm font-semibold text-[#023337]" style={{ gridTemplateColumns: COLS }}>
          <div className="px-4 py-3">STT</div>
          <div className="px-4 py-3">Mã</div>
          <div className="px-4 py-3">Mô tả</div>
          <div className="px-4 py-3">Loại giảm giá</div>
          <div className="px-4 py-3">Giá trị</div>
          <div className="px-4 py-3">Từ ngày</div>
          <div className="px-4 py-3">Đến ngày</div>
          <div className="px-4 py-3">Trạng thái</div>
          <div className="px-4 py-3">Hành động</div>
        </div>

        {/* Virtualized Body */}
        <div ref={tableContainerRef} className="overflow-auto flex-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-gray-400 text-sm">
              <Loader2 size={16} className="animate-spin" />
              Đang tải...
            </div>
          ) : vouchers.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
              Không có voucher nào
            </div>
          ) : (
            <>
              <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const v = vouchers[virtualRow.index];
                  return (
                    <div
                      key={v.id}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      className="grid border-t border-gray-100 hover:bg-gray-50 items-center text-sm text-black"
                      style={{
                        gridTemplateColumns: COLS,
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <div className="px-4 py-3 text-gray-500">{virtualRow.index + 1}</div>
                      <div className="px-4 py-3 font-mono font-semibold tracking-wide">{v.code}</div>
                      <div className="px-4 py-3 text-gray-600 truncate">{v.description ?? "—"}</div>
                      <div className="px-4 py-3">
                        <Badge className={`border-0 ${v.discountType === "PERCENTAGE" ? "bg-[var(--admin-green-light)] text-[var(--admin-green-dark)]" : "bg-gray-100 text-gray-600"}`}>
                          {v.discountType === "PERCENTAGE" ? "Phần trăm" : "Số tiền cố định"}
                        </Badge>
                      </div>
                      <div className="px-4 py-3 font-semibold">
                        {v.discountType === "PERCENTAGE" ? `${v.discountValue}%` : `${v.discountValue.toLocaleString("vi-VN")} ₫`}
                      </div>
                      <div className="px-4 py-3 text-gray-600">{formatDate(v.validFrom)}</div>
                      <div className="px-4 py-3 text-gray-600">{formatDate(v.validTo)}</div>
                      <div className="px-4 py-3">
                        <Badge className={`border-0 ${v.isActive ? "bg-[var(--admin-green-light)] text-[var(--admin-green-dark)]" : "bg-gray-100 text-gray-500"}`}>
                          {v.isActive ? "Còn hiệu lực" : "Hết hiệu lực"}
                        </Badge>
                      </div>
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(v)} className="p-1.5 hover:bg-[var(--admin-green-light)] rounded-md cursor-pointer" title="Chỉnh sửa">
                            <Pencil size={16} className="text-gray-600" />
                          </button>
                          <button onClick={() => setDeleteConfirmId(v.id)} className="p-1.5 hover:bg-red-50 rounded-md cursor-pointer" title="Xóa">
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {loadingMore && (
                <div className="flex items-center justify-center py-4 gap-2 text-gray-400 text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  Đang tải thêm...
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogMode === "create" ? "Thêm voucher mới" : "Chỉnh sửa voucher"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Mã voucher *</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="VD: SAVE20"
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-600">Loại giảm giá *</Label>
                <Select
                  value={form.discountType}
                  onValueChange={(v) => setForm((f) => ({ ...f, discountType: v as DiscountType }))}
                >
                  <SelectTrigger className="mt-1 w-full cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIXED_AMOUNT">Số tiền cố định (₫)</SelectItem>
                    <SelectItem value="PERCENTAGE">Phần trăm (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Mô tả</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="VD: Giảm 20% cho đơn hàng đầu tiên"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Giá trị * {form.discountType === "PERCENTAGE" ? "(%)" : "(₫)"}</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.discountValue}
                  onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                  placeholder={form.discountType === "PERCENTAGE" ? "VD: 20" : "VD: 50000"}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-600">Giới hạn sử dụng</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.usageLimit}
                  onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                  placeholder="Không giới hạn"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Từ ngày *</Label>
                <Input type="date" value={form.validFrom} onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))} className="mt-1 cursor-pointer" />
              </div>
              <div>
                <Label className="text-sm text-gray-600">Đến ngày *</Label>
                <Input type="date" value={form.validTo} onChange={(e) => setForm((f) => ({ ...f, validTo: e.target.value }))} className="mt-1 cursor-pointer" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
                className="cursor-pointer"
              />
              <Label
                className="text-sm text-gray-600 cursor-pointer"
                onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
              >
                {form.isActive ? "Còn hiệu lực" : "Hết hiệu lực"}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">Hủy</Button>
            <Button onClick={handleSave} disabled={saving} className="cursor-pointer">
              {saving ? "Đang lưu..." : dialogMode === "create" ? "Tạo" : "Cập nhật"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
