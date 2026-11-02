"use client";

import { motion } from "framer-motion";
import { StarField } from "../effects/star-field";
import { FloatingLanterns } from "../effects/floating-lanterns";
import { GoldButton } from "../ui/gold-button";
import { GoldShimmer } from "../ui/gold-shimmer";
import { MagicDust } from "../effects/magic-dust";
import { LanternReflection } from "../effects/lantern-reflection";
import { SceneAtmosphere } from "../effects/scene-atmosphere";
import { useIsMobile } from "../hooks/use-is-mobile";
import { useLanternContent } from "../content-context";
import { coupleNames } from "../config/wedding-defaults";

export function FinalInvitation() {
  const wedding = useLanternContent();
  const isMobile = useIsMobile();

  return (
    <section
      id="final"
      className="relative flex min-h-[90svh] min-h-[90dvh] items-center justify-center overflow-hidden px-0 py-16 sm:min-h-[95svh]"
      style={{
        background:
          "linear-gradient(180deg, #1e0f3a 0%, #0d0720 40%, #1a0830 80%, #2d1b5e 100%)",
      }}
    >
      <StarField className="absolute inset-0" count={isMobile ? 140 : 380} parallaxFactor={0.05} />
      <MagicDust count={isMobile ? 14 : 38} intensity="bright" className="opacity-75" />
      <FloatingLanterns count={isMobile ? 10 : 28} intensity="festival" />
      <LanternReflection className="opacity-70" />
      <SceneAtmosphere tone="night" className="opacity-80" />

      {/* central warm glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(244,196,68,0.18) 0%, rgba(232,130,154,0.12) 40%, transparent 68%)",
          filter: "blur(36px)",
        }}
      />
      <div aria-hidden className="aurora-glow absolute left-1/2 top-1/3 h-[52vh] w-[90vw] -translate-x-1/2 opacity-70" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 44, scale: 0.96, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mx-auto mb-6 flex items-center justify-center gap-3 sm:mb-8 sm:gap-4">
            <span className="h-px w-8 bg-lantern/50 sm:w-14" />
            <span className="font-cinzel text-[9px] font-semibold uppercase tracking-[0.32em] text-lantern-rose/80 sm:text-[10px] sm:tracking-[0.45em]">
              {wedding.final.signature}
            </span>
            <span className="h-px w-8 bg-lantern/50 sm:w-14" />
          </div>

          <p className="font-display text-[1.55rem] font-semibold leading-[1.35] text-cream/95 min-[380px]:text-3xl sm:text-4xl lg:text-[2.75rem]">
            {wedding.final.statement}
          </p>

          <GoldShimmer
            as="p"
            className="mt-8 font-display text-[2.4rem] font-bold leading-none sm:mt-10 sm:text-6xl"
          >
            {coupleNames(wedding, "\u2661")}
          </GoldShimmer>

          <p className="mt-3 font-serif text-lg italic text-blush/80 sm:text-xl">
            {wedding.event.dateLong}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-10 sm:mt-12"
          >
            <a href="#rsvp">
              <GoldButton size="lg" className="min-h-12 w-full max-w-xs sm:w-auto">
                {wedding.final.cta}
              </GoldButton>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
