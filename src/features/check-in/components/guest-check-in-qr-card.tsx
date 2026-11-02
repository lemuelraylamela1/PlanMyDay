"use client";

import * as React from "react";
import Image from "next/image";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  qrDataUrl: string;
  fullName: string;
  className?: string;
  /** Compact styling for thank-you / invite surfaces */
  variant?: "dashboard" | "invite";
}

export function downloadQrPng(qrDataUrl: string, fullName: string) {
  const safe = fullName.replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-") || "guest";
  const anchor = document.createElement("a");
  anchor.href = qrDataUrl;
  anchor.download = `wedding-id-${safe}.png`;
  anchor.click();
}

export function GuestCheckInQrCard({
  qrDataUrl,
  fullName,
  className,
  variant = "dashboard",
}: Props) {
  const isInvite = variant === "invite";

  return (
    <div
      className={
        className ??
        (isInvite
          ? "mt-6 flex w-full max-w-xs flex-col items-center rounded-2xl border border-lantern-rose/25 bg-white/80 p-5"
          : "flex flex-col items-center gap-3 rounded-lg border p-4")
      }
    >
      <p
        className={
          isInvite
            ? "font-cinzel text-[10px] font-semibold uppercase tracking-[0.28em] text-lantern-rose"
            : "text-xs font-medium uppercase tracking-wider text-muted-foreground"
        }
      >
        Your wedding ID
      </p>
      <Image
        src={qrDataUrl}
        alt={`Wedding ID QR for ${fullName}`}
        width={isInvite ? 220 : 200}
        height={isInvite ? 220 : 200}
        className="rounded-md border bg-white"
        unoptimized
      />
      <p
        className={
          isInvite
            ? "text-center font-serif text-lg text-[#2a1a14]"
            : "text-center text-sm font-medium"
        }
      >
        {fullName}
      </p>
      <p
        className={
          isInvite
            ? "text-center font-sans text-xs text-[#2a1a14]/75"
            : "text-center text-xs text-muted-foreground"
        }
      >
        Show this at the entrance. Download a spare copy for your phone.
      </p>
      {isInvite ? (
        <button
          type="button"
          onClick={() => downloadQrPng(qrDataUrl, fullName)}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#8b3a4a] px-5 py-2.5 font-cinzel text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm transition hover:bg-[#6f2e3b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b3a4a]/40"
        >
          <Download className="h-4 w-4 shrink-0 text-white" aria-hidden />
          Download QR
        </button>
      ) : (
        <Button type="button" variant="secondary" size="sm" onClick={() => downloadQrPng(qrDataUrl, fullName)}>
          <Download className="mr-2 h-4 w-4" />
          Download QR
        </Button>
      )}
    </div>
  );
}
