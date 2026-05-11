import { ApiError } from "@/lib/errors";
import type {
  ChatRequest,
  ChatResponse,
  SemanticSearchRequest,
  SemanticSearchResponse,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
// AI operations can take up to 15s (LLM inference) — use a longer timeout
const AI_TIMEOUT_MS = 20_000;

async function aiRequest<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      let message = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const err = await res.json();
        if (err.message) message = err.message;
      } catch {
        // non-JSON error body
      }
      throw new ApiError(message, res.status, path);
    }

    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timerId);
  }
}

export const aiService = {
  search(request: SemanticSearchRequest): Promise<SemanticSearchResponse> {
    return aiRequest("/api/v1/ai/search", request);
  },

  chat(request: ChatRequest): Promise<ChatResponse> {
    return aiRequest("/api/v1/ai/chat", request);
  },
};
