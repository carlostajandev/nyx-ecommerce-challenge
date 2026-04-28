export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly url?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isNetworkError(error: unknown): error is Error {
  return error instanceof Error && !(error instanceof ApiError);
}
