import { inviteFontVariables } from "@/features/invitations/components/fairytale/invite-fonts";
import "@/features/invitations/components/fairytale/invite.css";

export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return <div className={`invite-root ${inviteFontVariables}`}>{children}</div>;
}
