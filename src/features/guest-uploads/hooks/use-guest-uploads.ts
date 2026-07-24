"use client";

import * as React from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import type { GuestUploadSortField } from "@/features/guest-uploads/schemas";

export interface GuestUploadRow {
  id: string;
  guestName: string;
  message: string | null;
  fileName: string;
  mediaType: "IMAGE" | "VIDEO";
  uploadedAt: string;
}

export interface GuestUploadsListParams {
  q: string;
  sort: GuestUploadSortField;
  order: "asc" | "desc";
  mediaType: "IMAGE" | "VIDEO" | "all";
  page: number;
  pageSize: number;
}

export interface GuestUploadsListData {
  items: GuestUploadRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function fingerprint(data: GuestUploadsListData) {
  return `${data.total}|${data.page}|${data.totalPages}|${data.items
    .map((i) => `${i.id}:${i.uploadedAt}:${i.guestName}:${i.mediaType}`)
    .join(",")}`;
}

async function fetchGuestUploads(params: GuestUploadsListParams): Promise<GuestUploadsListData> {
  const search = new URLSearchParams({
    q: params.q,
    sort: params.sort,
    order: params.order,
    mediaType: params.mediaType,
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  const res = await fetch(`/api/guest-uploads?${search.toString()}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? "Failed to load uploads.");
  }
  return res.json();
}

/** Keep one SSE connection open; refetch the gallery only when the server signals a change. */
export function useGuestUploadsLive(weddingId: string) {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!weddingId) return;

    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    const connect = () => {
      if (stopped) return;
      es = new EventSource("/api/guest-uploads/live");

      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as { type?: string };
          if (payload.type === "refresh") {
            void queryClient.invalidateQueries({ queryKey: ["guest-uploads", weddingId] });
          }
        } catch {
          // Ignore malformed events.
        }
      };

      es.onerror = () => {
        es?.close();
        es = null;
        if (stopped) return;
        reconnectTimer = setTimeout(connect, 3_000);
      };
    };

    connect();

    return () => {
      stopped = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      es?.close();
    };
  }, [queryClient, weddingId]);
}

export function useGuestUploads(weddingId: string, params: GuestUploadsListParams) {
  return useQuery({
    queryKey: queryKeys.guestUploads(weddingId, params),
    queryFn: () => fetchGuestUploads(params),
    placeholderData: keepPreviousData,
    // No interval polling — useGuestUploadsLive + SSE triggers invalidation when data changes.
    refetchOnWindowFocus: true,
    staleTime: 30_000,
    notifyOnChangeProps: ["data", "error", "isPending", "isPlaceholderData"],
    structuralSharing: (oldData, newData) => {
      if (!oldData || !newData) return newData;
      const prev = oldData as GuestUploadsListData;
      const next = newData as GuestUploadsListData;
      return fingerprint(prev) === fingerprint(next) ? prev : next;
    },
  });
}
