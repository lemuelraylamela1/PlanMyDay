import { Cormorant_Garamond, Pinyon_Script } from "next/font/google";

/** Shared invite typography — applied on layout and portaled overlays. */
export const inviteDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const inviteScript = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

export const inviteFontVariables = `${inviteDisplay.variable} ${inviteScript.variable}`;
