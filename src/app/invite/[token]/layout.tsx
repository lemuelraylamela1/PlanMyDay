import type { Viewport } from "next";

import { inviteFontVariables } from "@/features/invitations/components/lantern/invite-fonts";
import "@/features/invitations/components/lantern/lantern.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0d0720",
};

export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return <div className={`invite-root ${inviteFontVariables}`}>{children}</div>;
}
