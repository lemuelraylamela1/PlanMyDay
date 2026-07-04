import { z } from "zod";

export const timelineEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(160),
  description: z.string().max(500).optional().or(z.literal("")),
  location: z.string().max(160).optional().or(z.literal("")),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional().or(z.literal("")),
});

export type TimelineEventInput = z.infer<typeof timelineEventSchema>;
