import { Cormorant_Garamond, Pinyon_Script } from "next/font/google";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const script = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} ${script.variable}`}>{children}</div>;
}
