"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { ACTIVITY_PAGE_SIZE, type ActivityListResult } from "@/features/activity/schemas";

async function fetchActivityPage(page: number, pageSize: number): Promise<ActivityListResult> {
  const search = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  const res = await fetch(`/api/activity?${search.toString()}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? "Failed to load activity.");
  }
  return res.json();
}

export function useActivity(weddingId: string, initialData?: ActivityListResult) {
  const pageSize = initialData?.pageSize ?? ACTIVITY_PAGE_SIZE;

  return useInfiniteQuery({
    queryKey: queryKeys.activity(weddingId, pageSize),
    queryFn: ({ pageParam }) => fetchActivityPage(pageParam, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    ...(initialData
      ? {
          initialData: {
            pages: [initialData],
            pageParams: [1],
          },
        }
      : {}),
  });
}
