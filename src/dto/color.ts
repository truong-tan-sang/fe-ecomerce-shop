/** ColorEntity from API */
export interface ColorEntity {
  id: number;
  name: string;
  hexCode: string;
  createdAt: string;
  updatedAt: string;
}

/** DTO for creating a new color */
export interface CreateColorDto {
  name: string;
  hexCode: string;
  createdAt: string;
  updatedAt: string;
}

/** DTO for updating a color (all fields optional) */
export interface UpdateColorDto {
  name?: string;
  hexCode?: string;
  createdAt?: string;
  updatedAt?: string;
}
