"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function OrnateScrollRod({ position }: { position: "top" | "bottom" }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-[-0.65rem] z-20 flex h-4 items-center sm:inset-x-[-0.85rem] sm:h-5",
        position === "top" ? "-top-2 sm:-top-2.5" : "-bottom-2 sm:-bottom-2.5",
      )}
    >
      <span className="scroll-rod-finial h-6 w-6 shrink-0 sm:h-8 sm:w-8" />
      <span className="scroll-rod-cap h-5 w-5 shrink-0 rounded-full sm:h-7 sm:w-7" />
      <span className="scroll-rod h-full flex-1 rounded-full" />
      <span className="scroll-rod-cap h-5 w-5 shrink-0 rounded-full sm:h-7 sm:w-7" />
      <span className="scroll-rod-finial h-6 w-6 shrink-0 sm:h-8 sm:w-8" />
    </div>
  );
}

export function OrnateFiligreeBanner({ position }: { position: "top" | "bottom" }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 320 36"
      className={cn(
        "pointer-events-none mx-auto h-7 w-[min(88%,18rem)] text-[#8a5a1e]/70 sm:h-8 sm:w-[min(82%,22rem)]",
        position === "top" ? "mb-1" : "mt-1",
      )}
      fill="currentColor"
    >
      <path d="M160 4c-8 10-22 14-38 14 12-2 20-8 24-14-8 4-18 6-28 4 10-6 22-8 34-4-6-4-8-8-6-12 6 6 12 10 14 12 2-2 8-6 14-12 2 4 0 8-6 12 12-4 24-2 34 4-10 2-20 0-28-4 4 6 12 12 24 14-16 0-30-4-38-14z" />
      <path
        d="M12 22c42-14 84-8 108 2-28 2-54 8-78 18 18-10 40-14 62-12-30 8-48 18-52 28 16-12 40-18 68-16-22 10-34 22-34 30 18-14 44-22 78-22s60 8 78 22c0-8-12-20-34-30 28-2 52 4 68 16-4-10-22-20-52-28 22-2 44 2 62 12-24-10-50-16-78-18 24-10 66-16 108-2-40 0-74 6-100 18C186 28 172 30 160 30s-26-2-48-8C86 28 52 22 12 22z"
        opacity="0.85"
      />
      <circle cx="160" cy="22" r="2.2" />
      <circle cx="132" cy="20" r="1.4" opacity="0.7" />
      <circle cx="188" cy="20" r="1.4" opacity="0.7" />
    </svg>
  );
}

export function OrnateSideFiligree({ side }: { side: "left" | "right" }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 28 420"
      preserveAspectRatio="none"
      className={cn(
        "pointer-events-none absolute top-8 bottom-8 w-5 text-[#8a5a1e]/45 sm:w-6",
        side === "left" ? "left-1.5 sm:left-2.5" : "right-1.5 scale-x-[-1] sm:right-2.5",
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
    >
      <path d="M14 8 C 8 40, 22 70, 14 100 S 6 160, 14 190 S 22 250, 14 280 S 6 340, 14 370 S 20 400, 14 412" />
      <path d="M14 40 c-8 6 -8 16 0 22 c8-6 8-16 0-22z" fill="currentColor" opacity="0.35" stroke="none" />
      <path d="M14 120 c-8 6 -8 16 0 22 c8-6 8-16 0-22z" fill="currentColor" opacity="0.35" stroke="none" />
      <path d="M14 210 c-8 6 -8 16 0 22 c8-6 8-16 0-22z" fill="currentColor" opacity="0.35" stroke="none" />
      <path d="M14 300 c-8 6 -8 16 0 22 c8-6 8-16 0-22z" fill="currentColor" opacity="0.35" stroke="none" />
      <path d="M14 380 c-8 6 -8 16 0 22 c8-6 8-16 0-22z" fill="currentColor" opacity="0.35" stroke="none" />
      <path d="M18 70 c6 4 8 10 4 16" opacity="0.7" />
      <path d="M18 160 c6 4 8 10 4 16" opacity="0.7" />
      <path d="M18 250 c6 4 8 10 4 16" opacity="0.7" />
      <path d="M18 340 c6 4 8 10 4 16" opacity="0.7" />
    </svg>
  );
}

export function OrnateWaxSeal({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative mx-auto flex h-14 w-14 items-center justify-center sm:h-16 sm:w-16",
        className,
      )}
    >
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 28%, #f0d089 0%, #d4a840 42%, #a67c2a 72%, #6b4a16 100%)",
          boxShadow:
            "0 8px 18px -6px rgba(60, 30, 8, 0.55), inset 0 2px 4px rgba(255, 245, 210, 0.45), inset 0 -3px 6px rgba(80, 40, 10, 0.35)",
        }}
      />
      <svg viewBox="0 0 48 48" className="relative h-8 w-8 text-[#5c3a12] sm:h-9 sm:w-9" fill="currentColor">
        <path d="M24 8c-1.2 5.5-4.8 9.2-9.5 11.2 3.2.4 6.2-.2 8.8-1.6-.6 3.8-2.2 7-4.8 9.4 3.4-.8 6.2-2.6 8-5.2.6 3.6.2 7-1.4 10.2 2.8-2.2 4.6-5.4 5.2-9 1.8 2.8 4.6 4.8 8 5.6-2.6-2.6-4.2-6-4.8-10 2.6 1.6 5.6 2.4 8.8 2-4.7-2-8.3-5.7-9.5-11.2-.4 1.6-1.2 3-2.4 4.2C25.2 11 24.4 9.6 24 8z" />
        <circle cx="24" cy="28" r="1.5" opacity="0.55" />
      </svg>
    </div>
  );
}

/**
 * Ornate Tangled-style parchment scroll frame.
 */
export function OrnateScroll({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative mx-auto w-full max-w-xl", className)}>
      <OrnateScrollRod position="top" />

      <div className="parchment parchment-edges ornate-scroll-body relative overflow-hidden px-5 py-8 sm:px-9 sm:py-11">
        <span aria-hidden className="parchment-grain pointer-events-none absolute inset-0" />
        <OrnateSideFiligree side="left" />
        <OrnateSideFiligree side="right" />

        <div className="relative z-10">
          <OrnateFiligreeBanner position="top" />
          <OrnateWaxSeal className="mb-4 sm:mb-5" />
          {children}
          <OrnateFiligreeBanner position="bottom" />
        </div>
      </div>

      <OrnateScrollRod position="bottom" />
    </div>
  );
}
