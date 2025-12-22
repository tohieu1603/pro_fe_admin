"use client";

import { useParams } from "next/navigation";
import ProductPreview from "@/components/products/product-preview";

export default function ProductPreviewPage() {
  const params = useParams();
  return <ProductPreview productId={params.id as string} />;
}
