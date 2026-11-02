"use client";

import { Heart } from "lucide-react";
import { useLanternContent } from "../content-context";
import { coupleNames } from "../config/wedding-defaults";

export function SiteFooter() {
  const wedding = useLanternContent();

  return (
    <footer
      className="relative overflow-hidden py-16"
      style={{
        background: "linear-gradient(180deg, #1e0f3a 0%, #0d0720 100%)",
        borderTop: "1px solid rgba(244,196,68,0.12)",
      }}
    >
      {/* top lantern rule */}
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #f4c444 50%, transparent)" }} />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <p className="font-display text-3xl font-semibold text-cream">
          {coupleNames(wedding, "\u2661")}
        </p>
        <p className="mt-2 font-serif italic" style={{ color: "#e8c880" }}>
          {wedding.event.dateLong}
        </p>
        <p className="mt-1 font-sans text-sm text-cream/50">
          {wedding.event.venue.name} · {wedding.event.venue.city}
        </p>

        <div className="mx-auto my-7 h-px w-32" style={{ background: "linear-gradient(90deg, transparent, rgba(244,196,68,0.5), transparent)" }} />

        <p className="flex items-center justify-center gap-2 font-sans text-[11px] uppercase tracking-[0.25em] text-cream/40">
          Made with <Heart className="h-3.5 w-3.5 text-lantern-rose" /> &amp; lots of lanterns
        </p>
        <p className="mt-2 font-sans text-xs text-cream/30" suppressHydrationWarning>
          © {new Date().getFullYear()} {coupleNames(wedding, " & ")}
        </p>
      </div>
    </footer>
  );
}
