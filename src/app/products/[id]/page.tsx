"use client";

import { useParams } from "next/navigation";
import ProductPreview from "@/components/products/product-preview";

export default function ProductDetailPage() {
  const params = useParams();
  return <ProductPreview productId={params.id as string} />;
}
