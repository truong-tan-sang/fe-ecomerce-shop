import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/services/product";
import type { ProductVariantWithMediaEntity } from "@/dto/product";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const page = parseInt(sp.get("page") || "1", 10);
    const perPage = parseInt(sp.get("perPage") || "20", 10);
    const searchText = sp.get("q") || undefined;
    const categoryName = sp.get("categoryName") || undefined;
    const colors = sp.getAll("colors").filter(Boolean);
    const sizes = sp.getAll("sizes").filter(Boolean);
    const conditions = sp.getAll("conditions").filter(Boolean);
    const minPrice = sp.get("minPrice");
    const maxPrice = sp.get("maxPrice");

    const authHeader = request.headers.get("authorization");
    const accessToken = authHeader?.replace("Bearer ", "") || undefined;

    const priceRange: [number, number] | undefined =
      minPrice && maxPrice ? [Number(minPrice), Number(maxPrice)] : undefined;

    const res = await productService.filterProducts({
      page,
      perPage,
      searchText,
      categories: categoryName ? [categoryName] : undefined,
      colors: colors.length ? colors : undefined,
      sizes: sizes.length ? sizes : undefined,
      priceRange,
      conditions: conditions.length ? conditions : undefined,
      accessToken,
    });

    const variants: ProductVariantWithMediaEntity[] = Array.isArray(res?.data) ? res.data : [];

    // Each variant is its own card — no grouping needed
    const cards = variants.map((v) => ({
      variantId: v.id,
      id: v.productId,
      name: v.variantName,
      stock: v.stock,
      productImageUrl: v.media?.[0]?.url ?? "",
      variants: [v],
    }));

    return NextResponse.json({ data: cards, count: cards.length });
  } catch (error) {
    console.error("[SearchAPI] Error:", error);
    return NextResponse.json({ error: "Không thể tải kết quả tìm kiếm" }, { status: 500 });
  }
}
