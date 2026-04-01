"use client";

import { useParams } from "next/navigation";
import ProductForm from "../../_components/ProductForm";

export default function AdminProductsEditPage() {
  const params = useParams();
  const productId = Number(params.id);

  return <ProductForm productId={productId} />;
}
