"use client";

import { motion } from "framer-motion";
import { MagicDust } from "../effects/magic-dust";
import { Fireflies } from "../effects/fireflies";

const LUXURY = [0.16, 1, 0.3, 1] as const;

export function Quote() {
  return (
    <section
      id="quote"
      className="relative flex min-h-[60svh] items-center justify-center overflow-hidden px-6 py-24"
      style={{
        background:
          "linear-gradient(180deg, #0d0720 0%, #160b2e 50%, #0d0720 100%)",
      }}
    >
      <MagicDust count={16} intensity="soft" className="opacity-50" />
      <Fireflies count={12} className="opacity-80" />

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[55vh] w-[55vw] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(244,196,68,0.12) 0%, rgba(232,130,154,0.08) 45%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: LUXURY }}
        className="relative z-10 mx-auto max-w-2xl text-center"
      >
        <div className="mb-8 flex items-center justify-center gap-5">
          <span
            className="h-px flex-1"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(244,196,68,0.5))",
            }}
          />
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 shrink-0 text-lantern opacity-80"
            fill="currentColor"
          >
            <path d="M12 2l2.4 5.6L20 8.6l-4 4.1.9 5.7L12 15.8 7.1 18.4 8 12.7 4 8.6l5.6-1z" />
          </svg>
          <span
            className="h-px flex-1"
            style={{
              background:
                "linear-gradient(90deg, rgba(244,196,68,0.5), transparent)",
            }}
          />
        </div>

        <blockquote>
          <p className="font-display text-[1.45rem] font-semibold leading-[1.4] text-cream/95 min-[380px]:text-[1.75rem] sm:text-4xl sm:leading-[1.35] lg:text-[2.6rem]">
            &ldquo;All at once, everything looks different. Now that I see
            you.&rdquo;
          </p>
          <footer className="mt-7 font-serif text-base italic text-lantern-soft sm:text-lg">
            — Tangled
          </footer>
        </blockquote>
      </motion.div>
    </section>
  );
}
