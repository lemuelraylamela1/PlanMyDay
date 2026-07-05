export const queryKeys = {
  notifications: (weddingId: string) => ["notifications", weddingId] as const,
  search: (weddingId: string, q: string) => ["search", weddingId, q] as const,
  dashboardStats: (weddingId: string) => ["dashboard-stats", weddingId] as const,
};
