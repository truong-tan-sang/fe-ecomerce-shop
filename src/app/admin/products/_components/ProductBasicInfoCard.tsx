"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductFormState } from "../_types";

interface ProductBasicInfoCardProps {
  formState: ProductFormState;
  onFieldChange: <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => void;
}

export default function ProductBasicInfoCard({
  formState,
  onFieldChange,
}: ProductBasicInfoCardProps) {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-[#023337] mb-4">
          Thông tin cơ bản
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm text-gray-600">
              Tên sản phẩm
            </Label>
            <Input
              id="name"
              value={formState.name}
              onChange={(e) => onFieldChange("name", e.target.value)}
              placeholder="Nhập tên sản phẩm"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-sm text-gray-600">
              Mô tả
            </Label>
            <Textarea
              id="description"
              value={formState.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
              placeholder="Nhập mô tả sản phẩm"
              rows={4}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="sku" className="text-sm text-gray-600">
              SKU
            </Label>
            <Input
              id="sku"
              value={formState.stockKeepingUnit}
              onChange={(e) => onFieldChange("stockKeepingUnit", e.target.value)}
              placeholder="VD: PROD-12345"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-[#023337] mb-4">Giá cả</h3>
        <div>
          <Label htmlFor="price" className="text-sm text-gray-600">
            Giá sản phẩm (VND)
          </Label>
          <Input
            id="price"
            type="number"
            min="0"
            value={formState.price}
            onChange={(e) => onFieldChange("price", parseInt(e.target.value) || 0)}
            placeholder="0"
            className="mt-1"
          />
        </div>
      </div>

      {/* Stock */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-[#023337] mb-4">Kho</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="stock" className="text-sm text-gray-600">
              Số lượng tồn kho
            </Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={formState.stock}
              onChange={(e) => onFieldChange("stock", parseInt(e.target.value) || 0)}
              placeholder="0"
              className="mt-1"
              disabled={formState.isUnlimitedStock}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="unlimited" className="text-sm text-gray-600">
              Không giới hạn
            </Label>
            <Switch
              id="unlimited"
              checked={formState.isUnlimitedStock}
              onCheckedChange={(checked) => onFieldChange("isUnlimitedStock", checked)}
            />
          </div>
          <div>
            <Label className="text-sm text-gray-600">Trạng thái</Label>
            <Select
              value={formState.status}
              onValueChange={(value: "ACTIVE" | "INACTIVE") =>
                onFieldChange("status", value)
              }
            >
              <SelectTrigger className="mt-1 cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE" className="cursor-pointer">Đang bán</SelectItem>
                <SelectItem value="INACTIVE" className="cursor-pointer">Ngừng bán</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
