"use client";

import * as React from "react";

import {
  useAnimationQuality,
  useAnimationQualityDiagnostics,
} from "@/features/invitations/components/fairytale/animation-quality/animation-quality-provider";

interface Snapshot {
  fps: number | null;
  average: number | null;
  deviceMemory: number | null;
  cpuCores: number | null;
  webgl: string;
  initial: string;
  ceiling: string;
  downgrades: number;
  upgrades: number;
  transitionActive: boolean;
  forced: boolean;
}

function formatFps(value: number | null) {
  return value === null ? "measuring" : value.toFixed(1);
}

/**
 * Development-only readout. Enable with `?animDebug=1`; force a tier with
 * `?quality=high|balanced|low`. Renders nothing in production builds.
 */
export function AnimationQualityDebug() {
  const enabled = React.useSyncExternalStore(
    subscribeToNothing,
    () => new URLSearchParams(window.location.search).has("animDebug"),
    () => false,
  );

  if (process.env.NODE_ENV === "production" || !enabled) return null;
  return <DebugPanel />;
}

function subscribeToNothing() {
  return () => {};
}

function DebugPanel() {
  const { quality, reduceMotion, compact, ready } = useAnimationQuality();
  const diagnostics = useAnimationQualityDiagnostics();
  const [snapshot, setSnapshot] = React.useState<Snapshot | null>(null);

  React.useEffect(() => {
    if (!diagnostics) return;
    const read = () => {
      const d = diagnostics.current;
      const sample = d.monitor?.latest ?? null;
      setSnapshot({
        fps: sample?.fps ?? null,
        average: sample?.average ?? null,
        deviceMemory: d.capabilities?.deviceMemory ?? null,
        cpuCores: d.capabilities?.cpuCores ?? null,
        webgl: d.capabilities?.webgl ?? "unknown",
        initial: d.initialQuality ?? "-",
        ceiling: d.ceiling ?? "-",
        downgrades: d.downgrades,
        upgrades: d.upgrades,
        transitionActive: d.transitionActive,
        forced: d.forced,
      });
    };
    read();
    const id = window.setInterval(read, 500);
    return () => window.clearInterval(id);
  }, [diagnostics]);

  const rows: [string, string][] = snapshot
    ? [
        ["quality", `${quality}${snapshot.forced ? " (forced)" : ""}${ready ? "" : " (pending)"}`],
        ["fps", formatFps(snapshot.fps)],
        ["fps avg 5s", formatFps(snapshot.average)],
        ["reduced motion", reduceMotion ? "yes" : "no"],
        ["adaptive", snapshot.downgrades > 0 ? `downgraded x${snapshot.downgrades}` : "not downgraded"],
        ["upgrades", String(snapshot.upgrades)],
        ["initial / ceiling", `${snapshot.initial} / ${snapshot.ceiling}`],
        ["device memory", snapshot.deviceMemory === null ? "unsupported" : `${snapshot.deviceMemory} GB`],
        ["cpu cores", snapshot.cpuCores === null ? "unsupported" : String(snapshot.cpuCores)],
        ["webgl", snapshot.webgl],
        ["viewport", compact ? "compact" : "wide"],
        ["transition lock", snapshot.transitionActive ? "on" : "off"],
      ]
    : [];

  return (
    <div
      aria-hidden
      data-anim-debug
      className="pointer-events-none fixed bottom-3 left-3 z-[200] min-w-[13rem] rounded-md bg-black/80 px-3 py-2 font-mono text-[11px] leading-relaxed text-white"
    >
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4">
          <span className="text-white/60">{label}</span>
          <span>{value}</span>
        </div>
      ))}
    </div>
  );
}
