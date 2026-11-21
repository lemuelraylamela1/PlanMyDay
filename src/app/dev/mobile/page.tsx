"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { RefreshCw, Smartphone } from "lucide-react";

type Device = {
  id: string;
  label: string;
  width: number;
  height: number;
};

const DEVICES: Device[] = [
  { id: "iphone-se", label: "iPhone SE", width: 375, height: 667 },
  { id: "iphone-14", label: "iPhone 14", width: 390, height: 844 },
  { id: "iphone-14-pro-max", label: "iPhone 14 Pro Max", width: 430, height: 932 },
  { id: "pixel-7", label: "Pixel 7", width: 412, height: 915 },
];

const DEFAULT_SRC = "/invite/PEsd6bjI_TKcgqw_6CWvQ00zizoyPQPQg66inax63sM";
const STORAGE_KEY = "pmd-mobile-emulator";

type StoredState = {
  deviceId: string;
  src: string;
};

function readStored(): Partial<StoredState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<StoredState>;
  } catch {
    return {};
  }
}

function normalizeSrc(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return DEFAULT_SRC;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed;
  }
  return `/${trimmed}`;
}

function MobileEmulator() {
  const searchParams = useSearchParams();
  const [ready, setReady] = React.useState(false);
  const [deviceId, setDeviceId] = React.useState("iphone-14");
  const [srcInput, setSrcInput] = React.useState(DEFAULT_SRC);
  const [src, setSrc] = React.useState(DEFAULT_SRC);
  const [frameKey, setFrameKey] = React.useState(0);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    const stored = readStored();
    const fromQuery = searchParams.get("src") || searchParams.get("url");
    const nextSrc = normalizeSrc(fromQuery || stored.src || DEFAULT_SRC);
    const nextDevice =
      searchParams.get("device") ||
      stored.deviceId ||
      "iphone-14";
    setSrcInput(nextSrc);
    setSrc(nextSrc);
    setDeviceId(DEVICES.some((d) => d.id === nextDevice) ? nextDevice : "iphone-14");
    setReady(true);
  }, [searchParams]);

  React.useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ deviceId, src } satisfies StoredState),
      );
    } catch {
      /* ignore quota */
    }
  }, [deviceId, src, ready]);

  const device = DEVICES.find((item) => item.id === deviceId) ?? DEVICES[1]!;

  const applySrc = () => {
    setSrc(normalizeSrc(srcInput));
    setFrameKey((n) => n + 1);
  };

  const reload = () => setFrameKey((n) => n + 1);

  if (!ready) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#121018] text-white/70">
        Loading emulator…
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#121018] text-[#f5efe6]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#121018]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-[#f4c444]" aria-hidden />
            <h1 className="font-serif text-lg tracking-tight">Mobile emulator</h1>
            <span className="rounded border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/50">
              stays open
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {DEVICES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDeviceId(item.id)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  deviceId === item.id
                    ? "border-[#f4c444]/70 bg-[#f4c444]/15 text-[#f4c444]"
                    : "border-white/15 text-white/70 hover:border-white/35"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-3 flex max-w-6xl flex-col gap-2 sm:flex-row">
          <input
            value={srcInput}
            onChange={(event) => setSrcInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") applySrc();
            }}
            spellCheck={false}
            className="min-w-0 flex-1 rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-[#f4c444]/40 placeholder:text-white/35 focus:ring-2"
            placeholder="/invite/… or full URL"
            aria-label="Preview URL"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={applySrc}
              className="rounded-lg bg-[#f4c444] px-4 py-2 text-sm font-semibold text-[#1a1205]"
            >
              Load
            </button>
            <button
              type="button"
              onClick={reload}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-sm text-white/80 hover:border-white/35"
              aria-label="Reload preview"
            >
              <RefreshCw className="h-4 w-4" />
              Reload
            </button>
          </div>
        </div>
      </header>

      <section className="flex justify-center px-4 py-8 sm:py-10">
        <div className="flex flex-col items-center gap-3">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
            {device.label} · {device.width}×{device.height}
          </p>

          <div
            className="relative rounded-[2.35rem] border border-white/20 bg-[#05040a] p-3 shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
            style={{ width: device.width + 24 }}
          >
            <div
              aria-hidden
              className="mx-auto mb-2 h-5 w-28 rounded-full bg-black/80"
            />
            <div
              className="overflow-hidden rounded-[1.6rem] bg-black"
              style={{ width: device.width, height: device.height }}
            >
              <iframe
                key={frameKey}
                ref={iframeRef}
                title="Mobile preview"
                src={src}
                className="h-full w-full border-0 bg-black"
                style={{ width: device.width, height: device.height }}
              />
            </div>
            <div
              aria-hidden
              className="mx-auto mt-2 h-1.5 w-28 rounded-full bg-white/20"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default function MobileEmulatorPage() {
  return (
    <React.Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center bg-[#121018] text-white/70">
          Loading emulator…
        </main>
      }
    >
      <MobileEmulator />
    </React.Suspense>
  );
}
