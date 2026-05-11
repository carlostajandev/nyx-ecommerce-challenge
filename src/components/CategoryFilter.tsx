"use client";

import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
}

export default function CategoryFilter({
  categories,
  active,
  onChange,
}: CategoryFilterProps) {
  const options = [
    { label: "All", value: "all" },
    ...categories.map((c) => ({
      label: c.charAt(0).toUpperCase() + c.slice(1),
      value: c,
    })),
  ];

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
      {options.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            active === value
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-400",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
