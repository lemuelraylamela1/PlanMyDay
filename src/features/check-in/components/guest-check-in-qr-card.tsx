"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Download, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface Props {
  qrDataUrl: string;
  fullName: string;
  /**
   * Same-origin HTTP URL serving the QR PNG. Required for in-app browsers
   * (Messenger / Facebook / Instagram) which ignore blob: and data: downloads.
   */
  downloadUrl?: string;
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

/** Messenger, Facebook, Instagram, LINE, WeChat, TikTok, Snapchat and generic Android WebViews. */
function isInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  return /FBAN|FBAV|FB_IAB|FBIOS|FB4A|Messenger|Instagram|Line\/|MicroMessenger|TikTok|musical_ly|Snapchat|; wv\)/i.test(
    navigator.userAgent,
  );
}

function isAndroid() {
  return typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
}

/** Sync so the user-gesture chain stays valid for Share / download. */
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
 * Download the wedding ID QR directly in a regular browser (no share sheet).
 * (In-app browsers are handled separately by GuestCheckInQrCard.)
 */
export async function downloadQrPng(qrDataUrl: string, fullName: string) {
  const filename = safeQrFileName(fullName);
  const blob = qrDataUrlToBlob(qrDataUrl);
  const objectUrl = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.rel = "noopener";
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    toast.success("Wedding ID QR downloaded", { description: filename });
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2_000);
  }
}

/** Trigger a download of a same-origin HTTP URL (works in Android in-app browsers). */
function downloadViaHttp(url: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function SaveQrOverlay({
  src,
  fullName,
  onClose,
}: {
  src: string;
  fullName: string;
  onClose: () => void;
}) {
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Portal to <body>: the card often sits inside transformed (animated) parents,
  // which would otherwise break `position: fixed`.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Save your wedding ID QR"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-sm flex-col items-center rounded-2xl bg-white p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="font-semibold text-neutral-900">Save your wedding ID</p>
        {/* Plain <img> so the native long-press "Save image" menu works. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`Wedding ID QR for ${fullName}`}
          width={260}
          height={260}
          className="mt-4 h-[260px] w-[260px] select-auto rounded-md border bg-white"
          style={{ WebkitTouchCallout: "default" }}
        />
        <p className="mt-3 text-sm font-medium text-neutral-900">{fullName}</p>
        <p className="mt-3 text-sm text-neutral-700">
          <strong>Press and hold</strong> the QR code, then tap{" "}
          <strong>Save image</strong> / <strong>Add to Photos</strong>.
        </p>
        <p className="mt-2 text-xs text-neutral-500">
          Not working? Take a screenshot, or open this page in Safari / Chrome using the{" "}
          <strong>⋯</strong> menu.
        </p>
      </div>
    </div>,
    document.body,
  );
}

export function GuestCheckInQrCard({
  qrDataUrl,
  fullName,
  downloadUrl,
  className,
  variant = "dashboard",
}: Props) {
  const isInvite = variant === "invite";
  const [showSave, setShowSave] = React.useState(false);
  const closeSave = React.useCallback(() => setShowSave(false), []);

  const handleDownload = () => {
    if (isInAppBrowser()) {
      // Messenger & co. silently drop blob:/data: downloads and lack file sharing.
      // Android WebViews hand real HTTP downloads to the system download manager;
      // iOS can't download at all, so offer long-press save on a real image.
      if (downloadUrl && isAndroid()) {
        downloadViaHttp(downloadUrl);
        toast.success("Downloading your wedding ID QR…", {
          description: "Check your notifications or Downloads folder.",
        });
        return;
      }
      setShowSave(true);
      return;
    }

    downloadQrPng(qrDataUrl, fullName).catch(() => {
      toast.error("Couldn't download the QR. Press and hold it to save instead.");
      setShowSave(true);
    });
  };

  const overlaySrc = downloadUrl ? `${downloadUrl}?inline=1` : qrDataUrl;

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
          onClick={handleDownload}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#8b3a4a] px-5 py-2.5 font-cinzel text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm transition hover:bg-[#6f2e3b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b3a4a]/40"
        >
          <Download className="h-4 w-4 shrink-0 text-white" aria-hidden />
          Download QR
        </button>
      ) : (
        <Button type="button" variant="secondary" size="sm" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download QR
        </Button>
      )}
      {showSave ? <SaveQrOverlay src={overlaySrc} fullName={fullName} onClose={closeSave} /> : null}
    </div>
  );
}
