import type { Product } from "@/features/products/types";

/**
 * Returns up to 3 products from the same category, sorted by rating descending.
 * Sorting by rating maximizes cross-sell conversion probability.
 */
export function getRelatedProducts(
  current: Product,
  all: Product[],
): Product[] {
  return all
    .filter((p) => p.category === current.category && p.id !== current.id)
    .sort((a, b) => b.rating.rate - a.rating.rate)
    .slice(0, 3);
}
