"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useProducts } from "@/features/products/hooks";
import { useCartStore } from "@/features/cart/store";
import { getRelatedProducts } from "@/features/recommendations/use-case";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/features/products/types";

interface RecommendationsProps {
  current: Product;
  onSelect: (product: Product) => void;
}

export default function Recommendations({
  current,
  onSelect,
}: RecommendationsProps) {
  const { data: allProducts } = useProducts(); // instant — already in React Query cache
  const addItem = useCartStore((s) => s.addItem);

  const related = useMemo(
    () => (allProducts ? getRelatedProducts(current, allProducts) : []),
    [current, allProducts],
  );

  if (related.length === 0) return null;

  return (
    <div className="border-t border-gray-100 pt-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        You might also like
      </p>
      <div className="flex flex-col gap-3">
        {related.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-3 rounded-xl border border-gray-100 p-2 transition-colors hover:bg-gray-50"
          >
            {/* Thumbnail */}
            <button
              onClick={() => onSelect(product)}
              className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-50"
              aria-label={`View ${product.title}`}
            >
              <Image
                src={product.image}
                alt={product.title}
                fill
                sizes="48px"
                className="object-contain p-1"
              />
            </button>

            {/* Info */}
            <button
              onClick={() => onSelect(product)}
              className="min-w-0 flex-1 text-left"
            >
              <p className="line-clamp-1 text-xs font-medium text-gray-900">
                {product.title}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-gray-700">
                {formatPrice(product.price)}
              </p>
            </button>

            {/* Quick add */}
            <button
              onClick={() => addItem(product)}
              className="shrink-0 rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-gray-700"
              aria-label={`Add ${product.title} to cart`}
            >
              Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
