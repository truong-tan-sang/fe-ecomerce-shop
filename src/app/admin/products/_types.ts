export interface VariantMatrixCell {
  stock: number;
  price: number;
}

/** Key format: "size__colorName" */
export type VariantMatrix = Record<string, VariantMatrixCell>;

export interface ColorEntry {
  id?: number;
  name: string;
  label: string;
  hex: string;
}

export interface ColorImage {
  color: string;
  file: File | null;
  previewUrl: string | null;
}

export interface ProductFormState {
  name: string;
  description: string;
  price: number;
  stock: number;
  stockKeepingUnit: string;
  currencyUnit: string;
  categoryId: number | null;
  voucherId: number | null;
  isUnlimitedStock: boolean;
  status: "ACTIVE" | "INACTIVE";
  selectedSizes: string[];
  selectedColors: ColorEntry[];
  variantMatrix: VariantMatrix;
  colorImages: ColorImage[];
}
