"use client";

import { useParams } from "next/navigation";
import Header from "@/components/header/navbar";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";

// Mock product data - replace with actual API call
const mockProduct = {
    id: "1",
    brand: "PAPLÉ",
    name: "Denim Jacket",
    rating: 4,
    reviewCount: 3,
    price: 39.0,
    originalPrice: 59.0,
    discount: 33,
    viewersCount: 24,
    stock: 9,
    sizes: ["M", "L", "XL", "XXL"],
    colors: [
        { color: "#b91c1c", name: "Đỏ" },
        { color: "#eab308", name: "Vàng" },
        { color: "#fb7185", name: "Hồng" },
    ],
    images: [
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80",
    ],
};

export default function ProductDetailPage() {
    const params = useParams();
    const productId = params.id as string;

    // TODO: Fetch actual product data based on productId
    const product = mockProduct;

    return (
        <div className="min-h-dvh flex flex-col">
            <Header />
            <main className="mx-auto w-full max-w-7xl px-3 md:px-20 py-20 md:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left: Image Gallery */}
                    <ProductGallery images={product.images} />

                    {/* Right: Product Info */}
                    <ProductInfo
                        brand={product.brand}
                        name={product.name}
                        rating={product.rating}
                        reviewCount={product.reviewCount}
                        price={product.price}
                        originalPrice={product.originalPrice}
                        discount={product.discount}
                        viewersCount={product.viewersCount}
                        stock={product.stock}
                        sizes={product.sizes}
                        colors={product.colors}
                    />
                </div>
            </main>
        </div>
    );
}
