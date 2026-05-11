import { useQuery } from "@tanstack/react-query";
import { productService } from "./api";
import type { GetProductsParams, RecommendationStrategy } from "./types";

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: GetProductsParams) => [...productKeys.lists(), params] as const,
  detail: (id: number) => [...productKeys.all, id] as const,
  categories: () => [...productKeys.all, "categories"] as const,
  recommendations: (id: number, strategy: RecommendationStrategy) =>
    [...productKeys.all, id, "recommendations", strategy] as const,
};

export function useProducts(params: GetProductsParams = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productService.getAll(params),
    staleTime: 5 * 60 * 1_000,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getById(id),
    enabled: id > 0,
    staleTime: 5 * 60 * 1_000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: productService.getCategories,
    staleTime: 60 * 60 * 1_000, // 1h — categories are static
  });
}

export function useRecommendations(
  productId: number,
  strategy: RecommendationStrategy = "hybrid",
) {
  return useQuery({
    queryKey: productKeys.recommendations(productId, strategy),
    queryFn: () => productService.getRecommendations(productId, strategy),
    enabled: productId > 0,
    staleTime: 15 * 60 * 1_000,
  });
}
