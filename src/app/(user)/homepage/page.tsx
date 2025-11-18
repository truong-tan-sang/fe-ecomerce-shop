"use client";
import { signOut } from "next-auth/react";
import Header from "@/components/header/navbar";
import HeroBanner from "@/components/home/HeroBanner";
import ProductCard from "@/components/product/ProductCard";

// Sample products data
const products = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
    name: "Lorem Ipsum",
    price: "Price",
    colors: [
      { color: "#b91c1c", selected: true },
      { color: "#166534" },
      { color: "#2563eb" },
    ],
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=400&q=80",
    name: "Lorem Ipsum",
    price: "Price",
    colors: [
      { color: "#b91c1c" },
      { color: "#166534", selected: true },
      { color: "#2563eb" },
    ],
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80",
    name: "Lorem Ipsum",
    price: "Price",
    colors: [
      { color: "#b91c1c" },
      { color: "#166534" },
      { color: "#2563eb", selected: true },
    ],
  },
  {
    id: 4,
    imageUrl: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=400&q=80",
    name: "Lorem Ipsum",
    price: "Price",
    colors: [
      { color: "#b91c1c", selected: true },
      { color: "#166534" },
      { color: "#2563eb" },
    ],
  },
  {
    id: 5,
    imageUrl: "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?auto=format&fit=crop&w=400&q=80",
    name: "Lorem Ipsum",
    price: "Price",
    colors: [
      { color: "#b91c1c" },
      { color: "#166534", selected: true },
      { color: "#2563eb" },
    ],
  },
  {
    id: 6,
    imageUrl: "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?auto=format&fit=crop&w=400&q=80",
    name: "Lorem Ipsum",
    price: "Price",
    colors: [
      { color: "#b91c1c" },
      { color: "#166534" },
      { color: "#2563eb", selected: true },
    ],
  },
  {
    id: 7,
    imageUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=400&q=80",
    name: "Lorem Ipsum",
    price: "Price",
    colors: [
      { color: "#b91c1c", selected: true },
      { color: "#166534" },
      { color: "#2563eb" },
    ],
  },
  {
    id: 8,
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80",
    name: "Lorem Ipsum",
    price: "Price",
    colors: [
      { color: "#b91c1c" },
      { color: "#166534", selected: true },
      { color: "#2563eb" },
    ],
  },
  {
    id: 9,
    imageUrl: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=400&q=80",
    name: "Lorem Ipsum",
    price: "Price",
    colors: [
      { color: "#b91c1c" },
      { color: "#166534" },
      { color: "#2563eb", selected: true },
    ],
  },
  {
    id: 10,
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80",
    name: "Lorem Ipsum",
    price: "Price",
    colors: [
      { color: "#b91c1c", selected: true },
      { color: "#166534" },
      { color: "#2563eb" },
    ],
  },
  {
    id: 11,
    imageUrl: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=400&q=80",
    name: "Lorem Ipsum",
    price: "Price",
    colors: [
      { color: "#b91c1c" },
      { color: "#166534", selected: true },
      { color: "#2563eb" },
    ],
  },
  {
    id: 12,
    imageUrl: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=400&q=80",
    name: "Lorem Ipsum",
    price: "Price",
    colors: [
      { color: "#b91c1c" },
      { color: "#166534" },
      { color: "#2563eb", selected: true },
    ],
  },
  {
    id: 13,
    imageUrl: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=400&q=80",
    name: "Lorem Ipsum",
    price: "Price",
    colors: [
      { color: "#b91c1c", selected: true },
      { color: "#166534" },
      { color: "#2563eb" },
    ],
  },
  {
    id: 14,
    imageUrl: "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?auto=format&fit=crop&w=400&q=80",
    name: "Lorem Ipsum",
    price: "Price",
    colors: [
      { color: "#b91c1c" },
      { color: "#166534", selected: true },
      { color: "#2563eb" },
    ],
  },
  {
    id: 15,
    imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=400&q=80",
    name: "Lorem Ipsum",
    price: "Price",
    colors: [
      { color: "#b91c1c" },
      { color: "#166534" },
      { color: "#2563eb", selected: true },
    ],
  },
  {
    id: 16,
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80",
    name: "Lorem Ipsum",
    price: "Price",
    colors: [
      { color: "#b91c1c", selected: true },
      { color: "#166534" },
      { color: "#2563eb" },
    ],
  },
  {
    id: 17,
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80",
    name: "Lorem Ipsum",
    price: "Price",
    colors: [
      { color: "#b91c1c" },
      { color: "#166534", selected: true },
      { color: "#2563eb" },
    ],
  },
  {
    id: 18,
    imageUrl: "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?auto=format&fit=crop&w=400&q=80",
    name: "Lorem Ipsum",
    price: "Price",
    colors: [
      { color: "#b91c1c" },
      { color: "#166534" },
      { color: "#2563eb", selected: true },
    ],
  },
];

export default function HomePage() {
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

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-2">
          {products.map((product) => (
          <ProductCard
              key={product.id}
              id={product.id.toString()}
              imageUrl={product.imageUrl}
              name={product.name}
              price={product.price}
              colors={product.colors}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
