import { z } from "zod";

export const tableSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  capacity: z.coerce.number().int().min(1).max(50).default(8),
  shape: z.enum(["round", "rectangle", "square"]).default("round"),
});

export type TableInput = z.infer<typeof tableSchema>;
