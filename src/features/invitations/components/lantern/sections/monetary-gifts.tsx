"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { SectionHeading } from "../ui/section-heading";
import { MagicDust } from "../effects/magic-dust";
import { FloatingLanterns } from "../effects/floating-lanterns";
import { SceneAtmosphere } from "../effects/scene-atmosphere";
import { useLanternContent } from "../content-context";

const LUXURY = [0.16, 1, 0.3, 1] as const;

export function MonetaryGifts() {
  const wedding = useLanternContent();
  const reduceMotion = useReducedMotion();
  const { gifts } = wedding;

  return (
    <section
      id="gifts"
      className="relative overflow-hidden lantern-section"
      style={{
        background: "linear-gradient(180deg, #120a22 0%, #1a0f2e 48%, #0d0720 100%)",
      }}
    >
      <MagicDust count={18} intensity="soft" className="opacity-50" />
      <FloatingLanterns count={8} intensity="ambient" className="opacity-45" />
      <SceneAtmosphere tone="night" className="opacity-55" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={gifts.eyebrow}
          title={gifts.title}
          intro={gifts.intro}
          theme="dark"
        />

        <div className="mt-12 grid gap-6 sm:mt-14 sm:grid-cols-2 sm:gap-8">
          {gifts.methods.map((method, index) => (
            <motion.article
              key={method.label}
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.85,
                ease: LUXURY,
                delay: reduceMotion ? 0 : index * 0.08,
              }}
              className="flex flex-col items-center rounded-2xl border border-[#f0d089]/25 bg-[#fffaf0]/95 px-5 py-6 text-center shadow-[0_18px_48px_-24px_rgba(0,0,0,0.55)] sm:px-7 sm:py-8"
            >
              <p className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.36em] text-[#8a5a1e]">
                {method.label}
              </p>
              <p className="mt-2 font-serif text-sm italic text-[#4a3218]/85 sm:text-base">
                {method.account}
              </p>
              <div className="mt-5 w-full max-w-[280px] overflow-hidden rounded-xl border border-[#b8860b]/25 bg-white p-3 sm:max-w-[320px] sm:p-4">
                <Image
                  src={method.imageSrc}
                  alt={method.imageAlt}
                  width={640}
                  height={800}
                  className="h-auto w-full object-contain"
                  unoptimized
                />
              </div>
              <p className="mt-4 font-cinzel text-[9px] uppercase tracking-[0.28em] text-[#8a5a1e]/70">
                Scan to send a gift
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
