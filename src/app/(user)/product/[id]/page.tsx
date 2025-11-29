import { notFound } from "next/navigation";
import { auth } from "@/auth";
import Header from "@/components/header/navbar";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ReviewSection from "@/components/product/ReviewSection";
import { productService } from "@/services/product";
import type { ProductDetailDto, ProductVariantDto, ReviewDto } from "@/dto/product-detail";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80";

// Helper to calculate average rating
function calculateAverageRating(reviews: ReviewDto[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal
}

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = params;
  
  // Get session for access token
  const session = await auth();
  const accessToken = session?.user?.access_token;

  // Fetch product data in parallel
  let product: ProductDetailDto | null = null;
  let variants: ProductVariantDto[] = [];
  let reviews: ReviewDto[] = [];

  try {
    console.log(`[ProductDetail] Fetching data for product ${id}`);
    
    const [productRes, variantsRes, reviewsRes] = await Promise.all([
      productService.getProductById(id, accessToken),
      productService.getProductVariants(id, accessToken),
      productService.getProductReviews(id, accessToken),
    ]);

    console.log("[ProductDetail] Product response:", productRes);
    console.log("[ProductDetail] Variants response:", variantsRes);
    console.log("[ProductDetail] Reviews response:", reviewsRes);

    product = productRes?.data || null;
    variants = Array.isArray(variantsRes?.data) ? variantsRes.data : [];
    reviews = Array.isArray(reviewsRes?.data) ? reviewsRes.data : [];
  } catch (error) {
    console.error("[ProductDetail] Failed to fetch product data:", error);
  }

  // If product not found, show 404
  if (!product) {
    notFound();
  }

  // Calculate average rating and review count
  const averageRating = calculateAverageRating(reviews);
  const reviewCount = reviews.length;

  // Collect images from variants (placeholder if none)
  const images = variants.length > 0 
    ? [PLACEHOLDER_IMAGE] // TODO: Backend needs to provide variant images via media endpoint
    : [PLACEHOLDER_IMAGE];

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-3 md:px-20 py-20 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Image Gallery */}
          <ProductGallery images={images} />

          {/* Right: Product Info */}
          <ProductInfo
            brand={product.name.split(' ')[0] || 'Brand'} // Extract brand from product name
            name={product.name}
            rating={averageRating}
            reviewCount={reviewCount}
            basePrice={product.price}
            viewersCount={0} // TODO: Backend doesn't provide viewer count yet
            baseStock={product.stock}
            variants={variants}
          />
        </div>

        {/* Review Section (display-only) */}
        <ReviewSection
          productId={product.id}
          initialReviews={reviews}
          variants={variants}
        />
      </main>
    </div>
  );
}
