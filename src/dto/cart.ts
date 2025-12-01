// Local cart DTOs (client-side persisted)

export interface CartItemDto {
  id: string; // unique cart line id (variantId-based)
  productId: number;
  productName: string;
  variantId: number;
  variantSize: string | null;
  variantColor: string | null;
  price: number; // unit price
  qty: number;
  imageUrl: string | null;
  selected: boolean;
}

export type CartDto = CartItemDto[];
