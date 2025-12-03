export interface CategoryDto {
  id: number;
  name: string;
  description: string;
  parentId: number | null;
  createByUserId: number;
  voucherId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description: string;
  parentId: number;
  createByUserId: number;
  voucherId: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  parentId?: number;
  createByUserId?: number;
  voucherId?: number;
}
