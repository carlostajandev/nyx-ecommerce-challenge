"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useProducts, useCategories } from "@/features/products/hooks";
import { useCartStore } from "@/features/cart/store";
import { useDebounce } from "@/lib/hooks/useDebounce";
import type { Product } from "@/features/products/types";
import type { SemanticSearchResponse } from "@/features/ai/types";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import AiSearchBar from "@/components/AiSearchBar";
import ChatWidget from "@/components/ChatWidget";
import Skeleton from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";

const PAGE_SIZE = 12;
const SKELETON_COUNT = PAGE_SIZE;

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
  const addItem = useCartStore((s) => s.addItem);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [aiResults, setAiResults] = useState<SemanticSearchResponse | null>(null);

  // Debounce the text search so we don't fire on every keystroke
  const debouncedSearch = useDebounce(searchInput, 400);

  const { data: categories = [] } = useCategories();

  const { data: productsPage, isLoading, isError, refetch } = useProducts({
    page: currentPage,
    size: PAGE_SIZE,
    category: activeCategory !== "all" ? activeCategory : undefined,
    search: debouncedSearch || undefined,
  });

  function handleCategoryChange(cat: string) {
    setActiveCategory(cat);
    setCurrentPage(0);
    setAiResults(null);
  }

  function handleSearchChange(value: string) {
    setSearchInput(value);
    setCurrentPage(0);
    if (aiResults) setAiResults(null);
  }

  function handleAiResults(response: SemanticSearchResponse | null) {
    setAiResults(response);
    if (response) setCurrentPage(0);
  }

  const isAiMode = aiResults !== null;
  const displayProducts = isAiMode
    ? aiResults.results
    : (productsPage?.content ?? []);

  if (isLoading && !isAiMode)
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <ProductGridSkeleton />
      </main>
    );

  if (isError && !isAiMode)
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
      {/* Toolbar: category filter + text search */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CategoryFilter
          categories={categories}
          active={activeCategory}
          onChange={handleCategoryChange}
        />
        <SearchBar value={searchInput} onChange={handleSearchChange} />
      </div>

      {/* AI semantic search */}
      <div className="mb-6">
        <AiSearchBar onResults={handleAiResults} />
      </div>

      {/* AI results context bar */}
      {isAiMode && (
        <div className="mb-4 flex items-center gap-2">
          <Sparkles size={14} className="text-gray-500" />
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{aiResults.results.length}</span> semantic
            results for{" "}
            <span className="font-semibold">&ldquo;{aiResults.query}&rdquo;</span>
          </p>
          <span className="text-xs text-gray-400">· {aiResults.processingMs}ms</span>
        </div>
      )}

      {displayProducts.length === 0 ? (
        <EmptyState
          message={
            isAiMode
              ? `No semantic results for "${aiResults?.query}"`
              : searchInput
                ? `No results for "${debouncedSearch}"`
                : "No products in this category"
          }
          hint={
            !isAiMode && (searchInput || activeCategory !== "all")
              ? "Try clearing the search or selecting a different category."
              : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {displayProducts.map((product) => (
              <div key={product.id} className="relative">
                {/* Similarity score badge in AI mode */}
                {isAiMode && aiResults.scores[String(product.id)] !== undefined && (
                  <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                    <Sparkles size={8} />
                    {(aiResults.scores[String(product.id)] * 100).toFixed(0)}%
                  </div>
                )}
                <ProductCard
                  product={product}
                  onViewDetail={setSelectedProduct}
                  onAddToCart={addItem}
                />
              </div>
            ))}
          </div>

          {/* Pagination — only in regular catalog mode */}
          {!isAiMode && productsPage && productsPage.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={productsPage.first}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-600">
                Page {productsPage.number + 1} of {productsPage.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={productsPage.last}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addItem}
        onSelect={setSelectedProduct}
      />

      <ChatWidget onSelectProduct={setSelectedProduct} />
    </main>
  );
}
