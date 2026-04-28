import { apiClient } from "@/lib/api-client";
import type { Category, Product } from "./types";

export const productService = {
  getAll(): Promise<Product[]> {
    return apiClient<Product[]>("/products");
  },

  getById(id: number): Promise<Product> {
    return apiClient<Product>(`/products/${id}`);
  },

  getCategories(): Promise<Category[]> {
    return apiClient<Category[]>("/products/categories");
  },
};
