"use client";

import { motion } from "framer-motion";
import { StarField } from "./effects/star-field";
import { FloatingLanterns } from "./effects/floating-lanterns";
import { MagicDust } from "./effects/magic-dust";
import { GoldButton } from "./ui/gold-button";

export function InvitationNotFound() {
  return (
    <div
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{
        background:
          "linear-gradient(180deg, #070314 0%, #0d0720 35%, #1e0f3a 70%, #2d1b5e 100%)",
      }}
    >
      <StarField className="absolute inset-0" count={280} parallaxFactor={0} />
      <MagicDust count={16} intensity="soft" className="opacity-50" />
      <FloatingLanterns count={8} intensity="ambient" className="opacity-60" />

      {/* central warm glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(244,196,68,0.14) 0%, rgba(232,130,154,0.1) 40%, transparent 68%)",
          filter: "blur(36px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-lg"
      >
        {/* lantern icon */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-lantern/30 bg-night/60 shadow-[0_0_40px_rgba(244,196,68,0.2)] backdrop-blur-md">
          <svg viewBox="0 0 100 140" className="h-10 w-10">
            <path
              d="M50 8 C24 8 13 25 13 54 C13 82 22 105 35 116 L65 116 C78 105 87 82 87 54 C87 25 76 8 50 8Z"
              fill="rgba(244,196,68,0.35)"
              stroke="rgba(244,196,68,0.7)"
              strokeWidth="2"
            />
            <path
              d="M50 95 C44 104 45 114 50 119 C56 114 56 104 50 95Z"
              fill="rgba(255,180,80,0.7)"
            />
          </svg>
        </div>

        <p className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.45em] text-lantern-rose/80">
          Invitation Not Found
        </p>

        <h1 className="mt-4 font-display text-4xl font-light leading-tight tracking-[-0.02em] text-cream sm:text-5xl">
          The lantern flew away
        </h1>

        <p className="mt-5 font-serif text-lg leading-relaxed text-cream/70">
          We couldn&apos;t find an invitation matching your link. It may have
          expired or the link may be incorrect. Please check the invitation you
          received and try again.
        </p>

        <div className="mt-10">
          <a href="/">
            <GoldButton size="lg" variant="outline">
              Return Home
            </GoldButton>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
