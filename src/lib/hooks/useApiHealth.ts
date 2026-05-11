import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

type ApiStatus = "connected" | "disconnected" | "checking";

export function useApiHealth(): ApiStatus {
  const { isSuccess, isError, isFetching } = useQuery({
    queryKey: ["__health"],
    queryFn: () => apiClient<string[]>("/products/categories"),
    retry: false,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  if (isFetching) return "checking";
  if (isSuccess) return "connected";
  if (isError) return "disconnected";
  return "checking";
}
