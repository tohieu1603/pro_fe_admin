"use client";

import { use } from "react";
import ProductForm from "@/components/products/ProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params);
  return <ProductForm productId={id} />;
}
