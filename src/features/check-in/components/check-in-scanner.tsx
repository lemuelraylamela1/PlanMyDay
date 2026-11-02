"use client";

import * as React from "react";
import { Camera, CheckCircle2, AlertTriangle, Loader2, RotateCcw, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats?: string[] }) => {
      detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string }>>;
    };
  }
}

export function CheckInScanner({ sessionToken, coupleNames, weddingTitle }: Props) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const lastCodeRef = React.useRef<string | null>(null);

  const [state, setState] = React.useState<ScanState>({ kind: "idle" });
  const [cameraError, setCameraError] = React.useState<string | null>(null);

  const stopCamera = React.useCallback(() => {
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
    setState({ kind: "scanning" });

    if (!window.BarcodeDetector) {
      setCameraError("This browser cannot scan from the camera. Use Upload QR image instead.");
      setState({ kind: "idle" });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();

      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });

      const tick = async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          rafRef.current = requestAnimationFrame(() => void tick());
          return;
        }
        try {
          const codes = await detector.detect(videoRef.current);
          const value = codes[0]?.rawValue;
          if (value) {
            await submitCode(value);
            return;
          }
        } catch {
          // keep scanning
        }
        rafRef.current = requestAnimationFrame(() => void tick());
      };

      rafRef.current = requestAnimationFrame(() => void tick());
    } catch {
      setCameraError("Camera permission denied or unavailable. Use Upload QR image instead.");
      setState({ kind: "idle" });
      stopCamera();
    }
  }

  async function onFileSelected(file: File | null) {
    if (!file) return;
    lastCodeRef.current = null;
    setState({ kind: "pending" });

    if (!window.BarcodeDetector) {
      setState({
        kind: "error",
        message: "This browser cannot read QR images. Try Chrome or Edge on mobile.",
      });
      return;
    }

    try {
      const bitmap = await createImageBitmap(file);
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const codes = await detector.detect(bitmap);
      bitmap.close();
      const value = codes[0]?.rawValue;
      if (!value) {
        setState({ kind: "error", message: "No QR code found in that image." });
        return;
      }
      await submitCode(value);
    } catch {
      setState({ kind: "error", message: "Could not read that image." });
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
          <div className="relative overflow-hidden rounded-2xl border bg-black aspect-[3/4]">
            <video
              ref={videoRef}
              className={cn(
                "h-full w-full object-cover",
                state.kind === "scanning" ? "opacity-100" : "opacity-0",
              )}
              playsInline
              muted
            />
            {state.kind !== "scanning" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/40 p-6 text-center">
                <Camera className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Camera preview will appear here</p>
              </div>
            ) : null}
          </div>

          {cameraError ? <p className="text-center text-sm text-amber-700">{cameraError}</p> : null}

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              onClick={() => void startCamera()}
              disabled={state.kind === "scanning"}
              className="w-full"
            >
              <Camera className="mr-2 h-4 w-4" />
              {state.kind === "scanning" ? "Scanning…" : "Start camera"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload QR image
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => void onFileSelected(e.target.files?.[0] ?? null)}
          />
        </div>
      ) : null}
    </div>
  );
}
