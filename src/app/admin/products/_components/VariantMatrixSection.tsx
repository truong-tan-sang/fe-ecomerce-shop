"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { ColorEntity } from "@/dto/color";
import type { ProductFormState, ColorEntry, VariantMatrix } from "../_types";
import { PRESET_SIZES } from "../_constants";

interface VariantMatrixSectionProps {
  formState: ProductFormState;
  apiColors: ColorEntity[];
  onFieldChange: <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => void;
  onAddColor: (color: ColorEntry) => void;
  onMatrixCellChange: (key: string, field: "stock" | "price", value: number) => void;
  onCreateColor: (name: string, hexCode: string) => Promise<void>;
  onUpdateColor: (id: number, name: string, hexCode: string) => Promise<void>;
  onDeleteColor: (id: number) => Promise<void>;
}

export default function VariantMatrixSection({
  formState,
  apiColors,
  onFieldChange,
  onAddColor,
  onMatrixCellChange,
  onCreateColor,
  onUpdateColor,
  onDeleteColor,
}: VariantMatrixSectionProps) {
  const [activeTab, setActiveTab] = useState<"stock" | "price">("stock");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);

  // Color management dialog state
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [colorDialogMode, setColorDialogMode] = useState<"create" | "edit">("create");
  const [editingColorId, setEditingColorId] = useState<number | null>(null);
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#000000");
  const [colorSaving, setColorSaving] = useState(false);

  const { selectedSizes, selectedColors, variantMatrix } = formState;

  const handleAddColor = (apiColor: ColorEntity) => {
    onAddColor({
      id: apiColor.id,
      name: apiColor.name,
      label: apiColor.name,
      hex: apiColor.hexCode,
    });
    setShowColorPicker(false);
  };

  const removeColor = (colorName: string) => {
    onFieldChange(
      "selectedColors",
      selectedColors.filter((c) => c.name !== colorName)
    );
    const newMatrix: VariantMatrix = {};
    Object.entries(variantMatrix).forEach(([key, value]) => {
      if (!key.endsWith(`__${colorName}`)) {
        newMatrix[key] = value;
      }
    });
    onFieldChange("variantMatrix", newMatrix);
    onFieldChange(
      "colorImages",
      formState.colorImages.filter((ci) => ci.color !== colorName)
    );
  };

  const addSize = (size: string) => {
    if (selectedSizes.includes(size)) return;
    const newSizes = [...selectedSizes, size];
    onFieldChange("selectedSizes", newSizes);
    const newMatrix: VariantMatrix = { ...variantMatrix };
    selectedColors.forEach((color) => {
      const key = `${size}__${color.name}`;
      if (!newMatrix[key]) {
        newMatrix[key] = { stock: 0, price: 0 };
      }
    });
    onFieldChange("variantMatrix", newMatrix);
    setShowSizePicker(false);
  };

  const removeSize = (size: string) => {
    onFieldChange(
      "selectedSizes",
      selectedSizes.filter((s) => s !== size)
    );
    const newMatrix: VariantMatrix = {};
    Object.entries(variantMatrix).forEach(([key, value]) => {
      if (!key.startsWith(`${size}__`)) {
        newMatrix[key] = value;
      }
    });
    onFieldChange("variantMatrix", newMatrix);
  };

  // Available colors = API colors not yet selected
  const availableColors = apiColors.filter(
    (c) => !selectedColors.find((sc) => sc.name === c.name || sc.id === c.id)
  );

  const availableSizes = PRESET_SIZES.filter(
    (s) => !selectedSizes.includes(s)
  );

  // Color dialog handlers
  const openCreateColorDialog = () => {
    setColorDialogMode("create");
    setEditingColorId(null);
    setColorName("");
    setColorHex("#000000");
    setColorDialogOpen(true);
    setShowColorPicker(false);
  };

  const openEditColorDialog = (apiColor: ColorEntity) => {
    setColorDialogMode("edit");
    setEditingColorId(apiColor.id);
    setColorName(apiColor.name);
    setColorHex(apiColor.hexCode);
    setColorDialogOpen(true);
    setShowColorPicker(false);
  };

  const handleColorDialogSave = async () => {
    if (!colorName.trim() || !colorHex.trim()) return;
    setColorSaving(true);
    try {
      if (colorDialogMode === "create") {
        await onCreateColor(colorName.trim(), colorHex.trim());
      } else if (editingColorId !== null) {
        await onUpdateColor(editingColorId, colorName.trim(), colorHex.trim());
      }
      setColorDialogOpen(false);
    } catch (err) {
      console.error("[VariantMatrix] Color save error:", err);
    } finally {
      setColorSaving(false);
    }
  };

  const handleDeleteColorClick = async (apiColor: ColorEntity) => {
    // Don't allow deleting a color that's currently in use
    const inUse = selectedColors.find((sc) => sc.id === apiColor.id || sc.name === apiColor.name);
    if (inUse) {
      alert(`Không thể xóa màu "${apiColor.name}" vì đang được sử dụng trong ma trận.`);
      return;
    }
    if (!confirm(`Xóa màu "${apiColor.name}"?`)) return;
    try {
      await onDeleteColor(apiColor.id);
    } catch (err) {
      console.error("[VariantMatrix] Delete color error:", err);
    }
  };

  const renderColorPickerContent = (showAllColors: boolean) => {
    const colors = showAllColors ? apiColors : availableColors;
    return (
      <div className="space-y-1">
        {colors.length === 0 && !showAllColors ? (
          <p className="text-xs text-gray-500 p-2">Đã chọn hết màu</p>
        ) : colors.length === 0 ? (
          <p className="text-xs text-gray-500 p-2">Chưa có màu nào</p>
        ) : (
          colors.map((color) => {
            const isSelected = selectedColors.find((sc) => sc.name === color.name || sc.id === color.id);
            return (
              <div key={color.id} className="flex items-center gap-1 group">
                <button
                  type="button"
                  onClick={() => !isSelected && handleAddColor(color)}
                  disabled={!!isSelected}
                  className={`flex items-center gap-2 flex-1 px-2 py-1.5 rounded text-sm cursor-pointer ${
                    isSelected
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
                    style={{ backgroundColor: color.hexCode }}
                  />
                  <span className="truncate">{color.name}</span>
                </button>
                <button
                  type="button"
                  onClick={() => openEditColorDialog(color)}
                  className="text-gray-400 hover:text-[var(--admin-green-dark)] text-xs px-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Sửa"
                >
                  &#9998;
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteColorClick(color)}
                  className="text-gray-400 hover:text-red-500 text-xs px-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Xóa"
                >
                  &#10005;
                </button>
              </div>
            );
          })
        )}
        {/* Create new color button */}
        <div className="border-t border-gray-100 pt-1 mt-1">
          <button
            type="button"
            onClick={openCreateColorDialog}
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-gray-100 text-sm text-[var(--admin-green-dark)] font-medium cursor-pointer"
          >
            + Tạo màu mới
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--admin-green-dark)]">
          Ma trận sản phẩm con
        </h3>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "stock" | "price")}>
          <TabsList className="bg-[var(--admin-green-light)]">
            <TabsTrigger value="stock" className="cursor-pointer">Số lượng</TabsTrigger>
            <TabsTrigger value="price" className="cursor-pointer">Giá</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Matrix table */}
      {selectedSizes.length > 0 && selectedColors.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-sm text-gray-500 w-20">
                  Size / Màu
                </th>
                {selectedColors.map((color) => (
                  <th key={color.name} className="p-2 text-center min-w-[100px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1">
                        <span
                          className="w-4 h-4 rounded-full inline-block border border-gray-300"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-sm text-gray-700">{color.label}</span>
                        <button
                          type="button"
                          onClick={() => removeColor(color.name)}
                          className="text-gray-400 hover:text-red-500 text-xs ml-1 cursor-pointer"
                        >
                          x
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
                <th className="p-2 w-24">
                  <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs cursor-pointer border-dashed"
                      >
                        + Thêm màu
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2">
                      {renderColorPickerContent(false)}
                    </PopoverContent>
                  </Popover>
                </th>
              </tr>
            </thead>
            <tbody>
              {selectedSizes.map((size) => (
                <tr key={size} className="border-t border-gray-100">
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      <span className="bg-[var(--admin-green-light)] text-[var(--admin-green-dark)] px-3 py-1 rounded-md text-sm font-medium">
                        {size}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSize(size)}
                        className="text-gray-400 hover:text-red-500 text-xs cursor-pointer"
                      >
                        x
                      </button>
                    </div>
                  </td>
                  {selectedColors.map((color) => {
                    const key = `${size}__${color.name}`;
                    const cell = variantMatrix[key] ?? { stock: 0, price: 0 };
                    return (
                      <td key={color.name} className="p-2">
                        <Input
                          type="number"
                          min="0"
                          value={activeTab === "stock" ? cell.stock : cell.price}
                          onChange={(e) =>
                            onMatrixCellChange(
                              key,
                              activeTab,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="text-center text-sm h-9"
                        />
                      </td>
                    );
                  })}
                  <td />
                </tr>
              ))}
              {/* Add size row */}
              <tr className="border-t border-gray-100">
                <td className="p-2" colSpan={selectedColors.length + 2}>
                  <Popover open={showSizePicker} onOpenChange={setShowSizePicker}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs cursor-pointer border-dashed"
                      >
                        + Thêm kích cỡ
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-36 p-2">
                      {availableSizes.length === 0 ? (
                        <p className="text-xs text-gray-500 p-2">Đã chọn hết size</p>
                      ) : (
                        <div className="space-y-1">
                          {availableSizes.map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => addSize(size)}
                              className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 text-sm cursor-pointer"
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">
            Thêm màu sắc và kích cỡ để tạo ma trận sản phẩm con
          </p>
          <div className="flex justify-center gap-3 mt-4">
            <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="cursor-pointer border-dashed">
                  + Thêm màu
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                {renderColorPickerContent(true)}
              </PopoverContent>
            </Popover>
            <Popover open={showSizePicker} onOpenChange={setShowSizePicker}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="cursor-pointer border-dashed">
                  + Thêm kích cỡ
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-36 p-2">
                <div className="space-y-1">
                  {PRESET_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => addSize(size)}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 text-sm cursor-pointer"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {/* Color create/edit dialog */}
      <Dialog open={colorDialogOpen} onOpenChange={setColorDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {colorDialogMode === "create" ? "Tạo màu mới" : "Chỉnh sửa màu"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">
                Tên màu
              </Label>
              <Input
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                placeholder="VD: Red, Blue, ..."
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">
                Mã màu (Hex)
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0"
                />
                <Input
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  placeholder="#FF0000"
                  className="flex-1"
                />
              </div>
            </div>
            {/* Preview */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <span
                className="w-8 h-8 rounded-full border border-gray-300"
                style={{ backgroundColor: colorHex }}
              />
              <span className="text-sm font-medium">{colorName || "Preview"}</span>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setColorDialogOpen(false)}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleColorDialogSave}
              disabled={colorSaving || !colorName.trim() || !colorHex.trim()}
              className="cursor-pointer"
            >
              {colorSaving ? "Đang lưu..." : colorDialogMode === "create" ? "Tạo" : "Cập nhật"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
