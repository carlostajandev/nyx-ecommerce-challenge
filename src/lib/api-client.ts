import { ApiError } from "./errors";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const TIMEOUT_MS = 8_000;
const MAX_RETRIES = 2;

function isRetriable(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status >= 500;
  }
  // Network errors and AbortError (timeout) are retriable
  return error instanceof Error;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timerId);
  }
}

async function attempt(url: string, options: RequestInit): Promise<Response> {
  const response = await fetchWithTimeout(url, options);

  if (!response.ok) {
    let message = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const body = await response.clone().json();
      if (body.message) message = body.message;
    } catch {
      // non-JSON error body — keep default message
    }
    throw new ApiError(message, response.status, url);
  }

  return response;
}

export async function apiClient<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  let lastError: unknown;

  for (let attempt_n = 0; attempt_n <= MAX_RETRIES; attempt_n++) {
    try {
      const response = await attempt(url, options);
      return (await response.json()) as T;
    } catch (error) {
      lastError = error;

      const shouldRetry = attempt_n < MAX_RETRIES && isRetriable(error);
      if (!shouldRetry) break;

      // Exponential backoff: 500ms, 1000ms
      await delay(500 * Math.pow(2, attempt_n));
    }
  }

  if (lastError instanceof ApiError) throw lastError;

  // Wrap unexpected errors (network, AbortError, etc.)
  throw new ApiError(
    lastError instanceof Error ? lastError.message : "Unknown error",
    0,
    url,
  );
}
