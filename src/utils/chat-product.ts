export interface ProductAttachment {
  productId: number;
  productName: string;
  price: number;
  imageUrl: string;
  variantId?: number;
  variantSize?: string;
  variantColor?: string;
}

const MARKER_START = "[[PC:";
const MARKER_END = "]]";

export function serializeProductCard(att: ProductAttachment): string {
  return `${MARKER_START}${JSON.stringify(att)}${MARKER_END}`;
}

export function parseProductCard(text: string): ProductAttachment | null {
  if (!text.startsWith(MARKER_START) || !text.endsWith(MARKER_END)) return null;
  try {
    const json = text.slice(MARKER_START.length, -MARKER_END.length);
    return JSON.parse(json) as ProductAttachment;
  } catch {
    return null;
  }
}
