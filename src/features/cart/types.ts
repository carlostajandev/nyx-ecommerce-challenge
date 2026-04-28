import type { Product } from "@/features/products/types";

export interface CartItem {
  product: Product;
  quantity: number;
}
