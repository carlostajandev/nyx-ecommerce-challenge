import { PackageSearch } from "lucide-react";

interface EmptyStateProps {
  message?: string;
  hint?: string;
}

export default function EmptyState({
  message = "No products found",
  hint = "Try adjusting your search or filter.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <PackageSearch className="h-12 w-12 text-gray-300" />
      <p className="font-medium text-gray-700">{message}</p>
      <p className="text-sm text-gray-400">{hint}</p>
    </div>
  );
}
