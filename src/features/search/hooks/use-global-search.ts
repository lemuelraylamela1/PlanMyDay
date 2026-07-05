"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import type { SearchResult } from "@/features/search/service";

async function fetchSearchResults(query: string): Promise<SearchResult[]> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? [];
}

export function useGlobalSearch(weddingId: string, query: string) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: queryKeys.search(weddingId, trimmed),
    queryFn: () => fetchSearchResults(trimmed),
    enabled: trimmed.length >= 2,
    staleTime: 60_000,
  });
}
