export const queryKeys = {
  notifications: (weddingId: string) => ["notifications", weddingId] as const,
  search: (weddingId: string, q: string) => ["search", weddingId, q] as const,
  dashboardStats: (weddingId: string) => ["dashboard-stats", weddingId] as const,
  guestUploads: (
    weddingId: string,
    filters: { q: string; sort: string; order: string; mediaType: string; page: number; pageSize: number },
  ) => ["guest-uploads", weddingId, filters] as const,
  activity: (weddingId: string, pageSize: number) => ["activity", weddingId, pageSize] as const,
};
