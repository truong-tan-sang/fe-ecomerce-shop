"use client";

import { Button } from "@/components/ui/button";

interface ProductFormActionsProps {
  mode: "add" | "edit";
  loading: boolean;
  onSave: () => void;
  onDelete?: () => void;
}

export default function ProductFormActions({
  mode,
  loading,
  onSave,
  onDelete,
}: ProductFormActionsProps) {
  return (
    <div className="flex gap-4 items-center">
      <Button
        type="button"
        onClick={onSave}
        disabled={loading}
        className="bg-[#4ea674] hover:bg-[#3d8a5f] text-white px-8 py-2.5 rounded-lg cursor-pointer"
      >
        {loading ? "Đang lưu..." : "Lưu thay đổi"}
      </Button>
      {mode === "edit" && onDelete && (
        <Button
          type="button"
          variant="outline"
          onClick={onDelete}
          disabled={loading}
          className="border-[#ac4f4f] text-[#ac4f4f] hover:bg-red-50 px-8 py-2.5 rounded-lg cursor-pointer"
        >
          Xóa sản phẩm
        </Button>
      )}
    </div>
  );
}
