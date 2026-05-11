import { apiClient } from "@/lib/api-client";
import type {
  GetProductsParams,
  Page,
  Product,
  RecommendationStrategy,
} from "./types";

export const productService = {
  getAll(params: GetProductsParams = {}): Promise<Page<Product>> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set("page", String(params.page));
    if (params.size !== undefined) query.set("size", String(params.size));
    if (params.category) query.set("category", params.category);
    if (params.search) query.set("search", params.search);
    const qs = query.toString();
    return apiClient<Page<Product>>(`/products${qs ? `?${qs}` : ""}`);
  },

  getById(id: number): Promise<Product> {
    return apiClient<Product>(`/products/${id}`);
  },

  getCategories(): Promise<string[]> {
    return apiClient<string[]>("/products/categories");
  },

  getRecommendations(
    id: number,
    strategy: RecommendationStrategy = "hybrid",
  ): Promise<Product[]> {
    return apiClient<Product[]>(
      `/products/${id}/recommendations?strategy=${strategy}`,
    );
  },
};
