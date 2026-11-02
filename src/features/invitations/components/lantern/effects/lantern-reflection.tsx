"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMounted } from "../hooks/use-mounted";
import {
  useLanternPerf,
  useMainEffectsActive,
} from "../performance/lantern-perf-provider";

export function LanternReflection({
  className,
  active: activeProp,
}: {
  className?: string;
  active?: boolean;
}) {
  const mounted = useMounted();
  const { profile } = useLanternPerf();
  const mainActive = useMainEffectsActive();
  const active = activeProp ?? mainActive;
  const lineCount = profile.reflectionMotion ? 8 : 4;

  if (!active) return null;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 h-[34vh] overflow-hidden",
        className,
      )}
    >
      <div
        className="absolute inset-x-[-10%] bottom-0 h-full"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(13,7,32,0.2) 18%, rgba(244,196,68,0.16) 48%, rgba(13,7,32,0.72) 100%)",
          maskImage: "linear-gradient(180deg, transparent 0%, black 30%, black 100%)",
        }}
      />
      {mounted &&
        Array.from({ length: lineCount }, (_, i) =>
          profile.reflectionMotion ? (
            <motion.span
              key={i}
              className="absolute bottom-[18%] h-px rounded-full"
              style={{
                left: `${8 + i * 12}%`,
                width: `${36 + (i % 3) * 18}px`,
                background:
                  "linear-gradient(90deg, transparent, rgba(255,223,112,0.7), transparent)",
                boxShadow: "0 0 18px rgba(244,196,68,0.35)",
              }}
              animate={{ x: [0, i % 2 ? 18 : -18, 0], opacity: [0.12, 0.55, 0.12] }}
              transition={{
                duration: 4 + i * 0.35,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ) : (
            <span
              key={i}
              className="absolute bottom-[18%] h-px rounded-full opacity-35"
              style={{
                left: `${12 + i * 22}%`,
                width: `${48 + (i % 2) * 20}px`,
                background:
                  "linear-gradient(90deg, transparent, rgba(255,223,112,0.65), transparent)",
              }}
            />
          ),
        )}
    </div>
  );
}
