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

function safeQrFileName(fullName: string) {
  const safe =
    fullName
      .replace(/[^\w\- ]+/g, "")
      .trim()
      .replace(/\s+/g, "-") || "guest";
  return `wedding-id-${safe}.png`;
}

/** Sync so the user-gesture chain stays valid for Share / download in WebViews. */
function qrDataUrlToBlob(qrDataUrl: string): Blob {
  const comma = qrDataUrl.indexOf(",");
  if (comma < 0) {
    throw new Error("Invalid QR image");
  }
  const header = qrDataUrl.slice(0, comma);
  const data = qrDataUrl.slice(comma + 1);
  const mime = /:(.*?);/.exec(header)?.[1] ?? "image/png";
  const isBase64 = /;base64/i.test(header);
  const binary = isBase64 ? atob(data) : decodeURIComponent(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

/**
 * Download / save the wedding ID QR.
 * Plain `<a download>` with a data URL fails in many mobile WebViews
 * (Messenger, Instagram, iOS Safari). Prefer Share sheet, then blob download.
 */
export async function downloadQrPng(qrDataUrl: string, fullName: string) {
  const filename = safeQrFileName(fullName);
  const blob = qrDataUrlToBlob(qrDataUrl);
  const file = new File([blob], filename, { type: "image/png" });

  // Best path on phones (incl. many in-app browsers): native share sheet.
  const canShareFile =
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] });

  if (canShareFile) {
    try {
      await navigator.share({
        files: [file],
        title: "Wedding ID QR",
        text: "Show this QR at the wedding entrance.",
      });
      return;
    } catch (error) {
      // User cancelled — don't fall through into a failed download attempt.
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }

  const objectUrl = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.rel = "noopener";
    anchor.style.display = "none";
    // Must be in the DOM for several mobile browsers.
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } catch {
    // Last resort for stubborn WebViews: open the image so they can long-press Save.
    window.open(objectUrl, "_blank", "noopener,noreferrer");
  } finally {
    // Keep the blob alive briefly so the download / new tab can start.
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2_000);
  }
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
            ? "font-cinzel text-[15px] font-bold uppercase tracking-[0.28em] text-lantern-rose"
            : "text-md font-bold uppercase tracking-wider text-muted-foreground"
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
          onClick={() => {
            void downloadQrPng(qrDataUrl, fullName);
          }}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#8b3a4a] px-5 py-2.5 font-cinzel text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm transition hover:bg-[#6f2e3b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b3a4a]/40"
        >
          <Download className="h-4 w-4 shrink-0 text-white" aria-hidden />
          Download QR
        </button>
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            void downloadQrPng(qrDataUrl, fullName);
          }}
        >
          <Download className="mr-2 h-4 w-4" />
          Download QR
        </Button>
      )}
    </div>
  );
}
