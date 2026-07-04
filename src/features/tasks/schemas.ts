import { z } from "zod";

export const taskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(160),
  description: z.string().max(1000).optional().or(z.literal("")),
  category: z.string().max(80).optional().or(z.literal("")),
  priority: taskPriorityEnum.default("MEDIUM"),
  deadline: z.string().optional().or(z.literal("")),
  assignedPerson: z.string().max(120).optional().or(z.literal("")),
});

export type TaskInput = z.infer<typeof taskSchema>;
