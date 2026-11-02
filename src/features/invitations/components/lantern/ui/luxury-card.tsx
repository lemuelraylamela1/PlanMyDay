import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "light" | "dark";

export function LuxuryCard({
  className,
  children,
  variant = "light",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: Variant }) {
  return (
    <div
      className={cn(
        "relative rounded-[1.75rem] p-8 sm:p-10",
        variant === "light"
          ? "border border-lantern-rose/20 bg-cream/90 text-ink shadow-[0_24px_64px_-32px_rgba(232,130,154,0.35)] backdrop-blur-sm"
          : "dark-glass text-ink-light shadow-[0_24px_64px_-32px_rgba(244,196,68,0.25)]",
        className
      )}
      {...props}
    >
      {/* inner hairline frame */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-3 rounded-[1.25rem] border",
          variant === "light"
            ? "border-lantern-rose/15"
            : "border-lantern/15"
        )}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
