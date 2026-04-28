"use client";

import { useState, useMemo } from "react";
import { useProducts } from "@/features/products/hooks";
import { useCartStore } from "@/features/cart/store";
import { useDebounce } from "@/lib/hooks/useDebounce";
import type { Product } from "@/features/products/types";
import type { Category } from "@/features/products/types";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import Skeleton from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";

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
  const addItem = useCartStore((s) => s.addItem);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [searchInput, setSearchInput] = useState("");

  // Debounce the raw input so filtering doesn't fire on every keystroke
  const searchQuery = useDebounce(searchInput, 300);

  // Derive unique categories from fetched products — no extra HTTP request
  const categories = useMemo<Category[]>(
    () =>
      (
        Array.from(new Set(products?.map((p) => p.category) ?? [])).sort() as Category[]
      ),
    [products],
  );

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const matchesCategory =
        activeCategory === "all" || p.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === "" ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  function handleAddToCart(product: Product) {
    addItem(product);
  }

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
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CategoryFilter
          categories={categories}
          active={activeCategory}
          onChange={setActiveCategory}
        />
        <SearchBar value={searchInput} onChange={setSearchInput} />
      </div>

      {filteredProducts.length === 0 ? (
        <EmptyState
          message={
            searchQuery
              ? `No results for "${searchQuery}"`
              : "No products in this category"
          }
          hint={
            searchQuery || activeCategory !== "all"
              ? "Try clearing the search or selecting a different category."
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetail={setSelectedProduct}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onSelect={setSelectedProduct}
      />
    </main>
  );
}
