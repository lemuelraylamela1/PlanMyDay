import { Playfair_Display, Cinzel, Lora, DM_Sans } from "next/font/google";

export const invitePlayfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const inviteCinzel = Cinzel({
  variable: "--font-cinzel-var",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
});

export const inviteLora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const inviteDm = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export const inviteFontVariables = [
  invitePlayfair.variable,
  inviteCinzel.variable,
  inviteLora.variable,
  inviteDm.variable,
].join(" ");
