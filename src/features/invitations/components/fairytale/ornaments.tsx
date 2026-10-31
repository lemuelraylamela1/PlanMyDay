import { cn } from "@/lib/utils";

export const displayFont = "font-[family-name:var(--font-display)]";
export const scriptFont = "font-[family-name:var(--font-script)]";
export const smallCaps = "text-[10px] font-medium uppercase tracking-[0.34em] sm:text-[11px] sm:tracking-[0.38em]";

export function GoldCorner({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 48 48"
      fill="none"
      className={cn("pointer-events-none absolute h-10 w-10 text-[#C9A66B]", className)}
    >
      <path d="M2 46V16C2 8.3 8.3 2 16 2h30" stroke="currentColor" strokeWidth="1" />
      <path d="M8 40V20c0-6.6 5.4-12 12-12h20" stroke="currentColor" strokeWidth="0.6" opacity="0.7" />
      <path d="M14 14c4-1 7 2 6 6-3 0-6-2-6-6Z" fill="currentColor" opacity="0.55" />
      <circle cx="26" cy="26" r="1.4" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export function GoldDivider({ className, tone = "gold" }: { className?: string; tone?: "gold" | "light" }) {
  const line = tone === "gold" ? "to-[#DDBF8D]" : "to-[#DDBF8D]/70";
  return (
    <span aria-hidden className={cn("flex items-center justify-center gap-3", className)}>
      <span className={cn("h-px w-16 bg-gradient-to-r from-transparent sm:w-24", line)} />
      <span className="h-1.5 w-1.5 rotate-45 border border-[#DDBF8D]" />
      <span className={cn("h-px w-16 bg-gradient-to-l from-transparent sm:w-24", line)} />
    </span>
  );
}

export function Fleuron({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 120 24" fill="none" className={cn("h-5 w-28 text-[#C9A66B]", className)}>
      <path
        d="M60 12c-6-8-16-9-22-4-4 3-9 5-15 3M60 12c6-8 16-9 22-4 4 3 9 5 15 3"
        stroke="currentColor"
        strokeWidth="0.9"
      />
      <path d="M60 12c-8 6-18 7-26 2M60 12c8 6 18 7 26 2" stroke="currentColor" strokeWidth="0.6" opacity="0.7" />
      <path d="M60 7.5 64.5 12 60 16.5 55.5 12Z" fill="currentColor" opacity="0.8" />
      <circle cx="16" cy="11" r="1.2" fill="currentColor" />
      <circle cx="104" cy="11" r="1.2" fill="currentColor" />
    </svg>
  );
}
