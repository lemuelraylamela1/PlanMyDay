import { inviteFontVariables } from "@/features/invitations/components/fairytale/invite-fonts";

export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return <div className={inviteFontVariables}>{children}</div>;
}
