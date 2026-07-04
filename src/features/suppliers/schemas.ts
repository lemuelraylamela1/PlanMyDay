import { z } from "zod";

export const supplierStatusEnum = z.enum([
  "PROSPECT",
  "CONTACTED",
  "BOOKED",
  "COMPLETED",
  "CANCELLED",
]);

export const supplierSchema = z.object({
  company: z.string().min(1, "Company is required").max(160),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  contactPerson: z.string().max(120).optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().max(200).optional().or(z.literal("")),
  contractAmount: z.coerce.number().min(0).default(0),
  downPayment: z.coerce.number().min(0).default(0),
  dueDate: z.string().optional().or(z.literal("")),
  status: supplierStatusEnum.default("PROSPECT"),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const supplierCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
export type SupplierCategoryInput = z.infer<typeof supplierCategorySchema>;
