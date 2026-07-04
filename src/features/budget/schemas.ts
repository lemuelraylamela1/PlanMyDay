import { z } from "zod";

export const budgetCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  estimatedCost: z.coerce.number().min(0).default(0),
});

export const budgetItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  estimatedCost: z.coerce.number().min(0).default(0),
  actualCost: z.coerce.number().min(0).default(0),
  paidAmount: z.coerce.number().min(0).default(0),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type BudgetCategoryInput = z.infer<typeof budgetCategorySchema>;
export type BudgetItemInput = z.infer<typeof budgetItemSchema>;
