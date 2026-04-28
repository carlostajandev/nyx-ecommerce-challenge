import { useQuery } from "@tanstack/react-query";
import { productService } from "./api";

export const productKeys = {
  all: ["products"] as const,
  detail: (id: number) => ["products", id] as const,
};

export function useProducts() {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: productService.getAll,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getById(id),
    enabled: id > 0,
  });
}
