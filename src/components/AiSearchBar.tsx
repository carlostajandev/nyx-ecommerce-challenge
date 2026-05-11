"use client";

import { useState } from "react";
import { Sparkles, X, Loader2 } from "lucide-react";
import { useSemanticSearch } from "@/features/ai/hooks";
import type { SemanticSearchResponse } from "@/features/ai/types";

interface AiSearchBarProps {
  onResults: (response: SemanticSearchResponse | null) => void;
}

export default function AiSearchBar({ onResults }: AiSearchBarProps) {
  const [query, setQuery] = useState("");
  const [hasResults, setHasResults] = useState(false);

  const { mutate: search, isPending } = useSemanticSearch();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    search(
      { query: q, topK: 8 },
      {
        onSuccess: (response) => {
          onResults(response);
          setHasResults(true);
        },
        onError: () => {
          onResults(null);
          setHasResults(false);
        },
      },
    );
  }

  function handleClear() {
    setQuery("");
    setHasResults(false);
    onResults(null);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={14} className="text-gray-500" />
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Semantic Search
        </span>
        <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-medium text-white">
          AI
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe what you're looking for in any language…"
          disabled={isPending}
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none disabled:opacity-50"
        />

        {hasResults && (
          <button
            type="button"
            onClick={handleClear}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100"
            aria-label="Clear AI search"
          >
            <X size={16} />
          </button>
        )}

        <button
          type="submit"
          disabled={!query.trim() || isPending}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-40"
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}
          Search
        </button>
      </form>
    </div>
  );
}
