import type { Product } from "@/features/products/types";

export interface SemanticSearchRequest {
  query: string;
  topK: number;
}

export interface SemanticSearchResponse {
  query: string;
  results: Product[];
  scores: Record<string, number>;
  strategy: string;
  processingMs: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  productId?: number;
  history?: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
  suggestedProducts: Product[];
  processingMs: number;
}
