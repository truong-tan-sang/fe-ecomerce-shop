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
        className="px-8 cursor-pointer"
      >
        {loading ? "Đang lưu..." : "Lưu thay đổi"}
      </Button>
      {mode === "edit" && onDelete && (
        <Button
          type="button"
          variant="destructive"
          onClick={onDelete}
          disabled={loading}
          className="px-8 cursor-pointer"
        >
          Xóa sản phẩm
        </Button>
      )}
    </div>
  );
}
