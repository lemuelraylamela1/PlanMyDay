import { z } from "zod";

export const emailKindEnum = z.enum(["INVITATION", "REMINDER", "THANK_YOU", "CUSTOM"]);

export const emailTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  kind: emailKindEnum.default("CUSTOM"),
  subject: z.string().min(1, "Subject is required").max(200),
  body: z.string().min(1, "Body is required").max(10000),
});

export type EmailTemplateInput = z.infer<typeof emailTemplateSchema>;
