import type { ReviewDto } from "./product-detail";

export interface AdminReviewDto extends ReviewDto {
  user?: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
  product?: {
    id: number;
    name: string;
  } | null;
  productVariant?: {
    id: number;
    variantName: string;
    variantColor: string;
    variantSize: string;
  } | null;
}
