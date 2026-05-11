import { useMutation } from "@tanstack/react-query";
import { aiService } from "./api";
import type { ChatRequest, SemanticSearchRequest } from "./types";

export function useSemanticSearch() {
  return useMutation({
    mutationFn: (request: SemanticSearchRequest) => aiService.search(request),
  });
}

export function useChat() {
  return useMutation({
    mutationFn: (request: ChatRequest) => aiService.chat(request),
  });
}
