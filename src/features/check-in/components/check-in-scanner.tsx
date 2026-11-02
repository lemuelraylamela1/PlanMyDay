"use client";

import * as React from "react";
import { Camera, CheckCircle2, AlertTriangle, Loader2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  cameraSupportMessage,
  decodeQrFromVideo,
  requestCameraStream,
} from "@/features/check-in/lib/decode-qr";

type ScanSuccess = {
  fullName: string;
  alreadyCheckedIn: boolean;
  checkedInAt: string;
  plusOneName: string | null;
};

type ScanState =
  | { kind: "idle" }
  | { kind: "scanning" }
  | { kind: "pending" }
  | { kind: "success"; data: ScanSuccess }
  | { kind: "error"; message: string };

interface Props {
  sessionToken: string;
  coupleNames: string;
  weddingTitle: string;
}

export function CheckInScanner({ sessionToken, coupleNames, weddingTitle }: Props) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const lastCodeRef = React.useRef<string | null>(null);
  const scanningRef = React.useRef(false);

  const [state, setState] = React.useState<ScanState>({ kind: "idle" });
  const [cameraError, setCameraError] = React.useState<string | null>(null);

  const stopCamera = React.useCallback(() => {
    scanningRef.current = false;
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  React.useEffect(() => () => stopCamera(), [stopCamera]);

  async function submitCode(guestCode: string) {
    if (!guestCode || lastCodeRef.current === guestCode) return;
    lastCodeRef.current = guestCode;
    scanningRef.current = false;
    setState({ kind: "pending" });
    stopCamera();

    try {
      const res = await fetch("/api/public/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken, guestCode }),
      });
      const payload = (await res.json().catch(() => null)) as
        | {
            success?: boolean;
            fullName?: string;
            alreadyCheckedIn?: boolean;
            checkedInAt?: string;
            plusOneName?: string | null;
            error?: string;
          }
        | null;

      if (!res.ok || !payload?.success || !payload.fullName || !payload.checkedInAt) {
        setState({
          kind: "error",
          message: payload?.error || "Could not verify this guest.",
        });
        return;
      }

      setState({
        kind: "success",
        data: {
          fullName: payload.fullName,
          alreadyCheckedIn: Boolean(payload.alreadyCheckedIn),
          checkedInAt: payload.checkedInAt,
          plusOneName: payload.plusOneName ?? null,
        },
      });
    } catch {
      setState({ kind: "error", message: "Network error. Please try again." });
    }
  }

  async function startCamera() {
    setCameraError(null);
    lastCodeRef.current = null;

    const blocked = cameraSupportMessage();
    if (blocked) {
      setCameraError(blocked);
      setState({ kind: "idle" });
      return;
    }

    setState({ kind: "scanning" });

    try {
      const stream = await requestCameraStream();
      streamRef.current = stream;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) {
        throw new Error("Camera preview failed to load. Refresh and try again.");
      }

      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      video.muted = true;
      await video.play();

      scanningRef.current = true;
      let lastScanAt = 0;

      const tick = async () => {
        if (!scanningRef.current) return;
        const now = performance.now();
        if (now - lastScanAt > 180 && videoRef.current && canvasRef.current) {
          lastScanAt = now;
          if (videoRef.current.readyState >= 2) {
            try {
              const value = await decodeQrFromVideo(videoRef.current, canvasRef.current);
              if (value) {
                await submitCode(value);
                return;
              }
            } catch {
              // keep scanning
            }
          }
        }
        rafRef.current = requestAnimationFrame(() => void tick());
      };

      rafRef.current = requestAnimationFrame(() => void tick());
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not start the camera. Open this page in Chrome or Safari and allow camera access.";
      setCameraError(message);
      setState({ kind: "idle" });
      stopCamera();
    }
  }

  function reset() {
    lastCodeRef.current = null;
    setState({ kind: "idle" });
    setCameraError(null);
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <header className="text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Guest check-in</p>
        <h1 className="mt-2 font-serif text-3xl text-foreground">{coupleNames || weddingTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Scan each guest&apos;s wedding ID QR to confirm they accepted and mark them arrived.
        </p>
      </header>

      {state.kind === "success" ? (
        <div
          className={cn(
            "rounded-2xl border p-6 text-center shadow-sm",
            state.data.alreadyCheckedIn
              ? "border-amber-300 bg-amber-50"
              : "border-emerald-300 bg-emerald-50",
          )}
        >
          {state.data.alreadyCheckedIn ? (
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-600" />
          ) : (
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          )}
          <p className="mt-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {state.data.alreadyCheckedIn ? "Already arrived" : "Arrived"}
          </p>
          <p className="mt-2 font-serif text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            {state.data.fullName}
          </p>
          {state.data.plusOneName ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Expected plus-one: <span className="font-medium text-foreground">{state.data.plusOneName}</span>
            </p>
          ) : null}
          <Button className="mt-6 w-full" onClick={reset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Scan next guest
          </Button>
        </div>
      ) : null}

      {state.kind === "error" ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-destructive" />
          <p className="mt-3 text-base font-medium text-destructive">{state.message}</p>
          <Button className="mt-6 w-full" variant="outline" onClick={reset}>
            Try again
          </Button>
        </div>
      ) : null}

      {state.kind === "pending" ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Verifying guest…</p>
        </div>
      ) : null}

      {state.kind === "idle" || state.kind === "scanning" ? (
        <div className="space-y-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border bg-black">
            <video
              ref={videoRef}
              className={cn(
                "h-full w-full object-cover",
                state.kind === "scanning" ? "opacity-100" : "opacity-0",
              )}
              playsInline
              muted
              autoPlay
            />
            <canvas ref={canvasRef} className="hidden" aria-hidden />
            {state.kind !== "scanning" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/40 p-6 text-center">
                <Camera className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Camera preview will appear here</p>
              </div>
            ) : (
              <div className="pointer-events-none absolute inset-x-8 top-1/2 h-48 -translate-y-1/2 rounded-xl border-2 border-white/70" />
            )}
          </div>

          {cameraError ? <p className="text-center text-sm text-amber-700">{cameraError}</p> : null}

          <Button
            onClick={() => void startCamera()}
            disabled={state.kind === "scanning"}
            className="w-full"
            size="lg"
          >
            <Camera className="mr-2 h-4 w-4" />
            {state.kind === "scanning" ? "Scanning…" : "Start camera"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
