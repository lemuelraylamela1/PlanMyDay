import { z } from "zod";

export const proposalStatusSchema = z.enum(["ACCEPTED", "DECLINED"]);

export const entourageRoles = [
  "NINONG_AND_NINANG",
  "MAID_OF_HONOR",
  "BRIDESMAID",
  "BEST_MAN",
  "GROOMSMAN",
] as const;

export const entourageRoleSchema = z.enum(entourageRoles);

export type EntourageRole = z.infer<typeof entourageRoleSchema>;

export const entourageRoleLabels: Record<EntourageRole, string> = {
  NINONG_AND_NINANG: "Ninong and Ninang",
  MAID_OF_HONOR: "Maid of Honor",
  BRIDESMAID: "Bridesmaid",
  BEST_MAN: "Best Man",
  GROOMSMAN: "Groomsman",
};

export function entouragePlace(
  role: EntourageRole,
  groomName?: string | null,
  brideName?: string | null,
) {
  const label = entourageRoleLabels[role];
  const groom = groomName?.trim();
  const bride = brideName?.trim();
  if ((role === "BEST_MAN" || role === "GROOMSMAN") && groom) return `${groom}'s ${label}`;
  if ((role === "MAID_OF_HONOR" || role === "BRIDESMAID") && bride) return `${bride}'s ${label}`;
  return `our ${label}`;
}

export function entourageDefaultMessage(role: EntourageRole) {
  if (role === "NINONG_AND_NINANG") {
    return "Your guidance and presence have meant so much to us. Would you honor us by being part of our wedding as one of our principal sponsors?";
  }
  return `Your presence has meant so much to us. Would you honor us by being our ${entourageRoleLabels[role]}?`;
}

export const sponsorProposalSchema = z.object({
  role: entourageRoleSchema,
  name: z.string().trim().min(1, "Name is required.").max(200),
  email: z.string().trim().email("Enter a valid email.").optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  customMessage: z
    .string()
    .trim()
    .min(1, "A personal proposal message is required.")
    .max(5000),
});

export const proposalResponseSchema = z.object({
  token: z.string().min(20, "This proposal link is invalid."),
  status: proposalStatusSchema,
  responseMessage: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type SponsorProposalInput = z.infer<typeof sponsorProposalSchema>;
