"use client";

import { useState } from "react";
import { useProducts } from "@/features/products/hooks";
import type { Product } from "@/features/products/types";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import Skeleton from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";

const SKELETON_COUNT = 12;

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
        >
          <Skeleton className="h-52 w-full rounded-xl" />
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-24" />
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CatalogPage() {
  const { data: products, isLoading, isError, refetch } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Placeholder — will be replaced with Zustand action in Phase 3
  function handleAddToCart(_product: Product) {}

  if (isLoading)
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <ProductGridSkeleton />
      </main>
    );

  if (isError)
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <ErrorState
          message="Failed to load products. Check your connection and try again."
          onRetry={() => refetch()}
        />
      </main>
    );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* SearchBar and CategoryFilter wired in upcoming commit */}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {(products ?? []).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onViewDetail={setSelectedProduct}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </main>
  );
}
