import { z } from "zod";

export const activityListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(50).default(20),
});

export type ActivityListFilter = z.infer<typeof activityListSchema>;

export const ACTIVITY_PAGE_SIZE = 20;

export interface ActivityLogItem {
  id: string;
  action: string;
  summary: string;
  entityType: string;
  createdAt: string;
  user: { name: string | null; email: string } | null;
}

export interface ActivityListResult {
  items: ActivityLogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
