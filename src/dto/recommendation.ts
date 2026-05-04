export interface OutfitRecommendationVariantDto {
  id: number;
  productId: number;
  variantName: string;
  variantColor: string;
  variantSize: string;
  price: number;
  stock: number;
  soldQuantity: number;
  colorId: number;
  stockKeepingUnit: string;
  currencyUnit: string;
  createdAt: string;
  updatedAt: string;
  reviews: { id: number; rating: number }[];
}
