import Header from "@/components/header/navbar";
import HeroBanner from "@/components/home/HeroBanner";
import ProductGrid from "@/components/product/ProductGrid";
import { productService } from "@/services/product";
import { auth } from "@/auth";
import type { ProductDto } from "@/dto/product";

export default async function HomePage() {
  // Get session for access token
  const session = await auth();
  const accessToken = session?.user?.access_token;

  // Fetch first page of products from API (SSR)
  let initialProducts: ProductDto[] = [];
  let initialPage = 1;
  let initialHasMore = false;

  try {
    console.log("[HomePage] Fetching initial products with token:", accessToken?.substring(0, 20));
    const res = await productService.getAllProducts({ page: 1, perPage: 20, accessToken });
    console.log("[HomePage] Products API response:", res);
    
    // Backend returns products directly in data array (no pagination meta)
    if (res?.data && Array.isArray(res.data)) {
      initialProducts = res.data;
      initialPage = 1;
      initialHasMore = initialProducts.length === 20;
      console.log("[HomePage] Loaded", initialProducts.length, "products; hasMore:", initialHasMore);
    }
  } catch (error) {
    console.error("[HomePage] Failed to fetch products:", error);
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-3 md:px-6 py-6">
        {/* Hero Banner */}
        <HeroBanner />

        {/* Section Divider */}
        <div className="relative my-8 md:my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-6 text-sm font-medium text-gray-700 uppercase tracking-wider">
              GỢI Ý HÔM NAY
            </span>
          </div>
        </div>

        {/* Product Grid with Infinite Scroll */}
        <ProductGrid 
          initialProducts={initialProducts}
          initialPage={initialPage}
          initialHasMore={initialHasMore}
        />
      </main>
    </div>
  );
}
