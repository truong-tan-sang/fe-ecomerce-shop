import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/services/product";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("perPage") || "20", 10);
    
    // Get access token from Authorization header
    const authHeader = request.headers.get("authorization");
    const accessToken = authHeader?.replace("Bearer ", "");

    console.log(`[ProductsAPI] Fetching page ${page}, perPage ${perPage}`);

    const response = await productService.getAllProducts({
      page,
      perPage,
      accessToken,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[ProductsAPI] Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
