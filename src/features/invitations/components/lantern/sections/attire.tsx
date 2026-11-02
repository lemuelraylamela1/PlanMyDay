"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { MagicDust } from "../effects/magic-dust";
import { SceneAtmosphere } from "../effects/scene-atmosphere";
import { useLanternContent } from "../content-context";

const LUXURY = [0.16, 1, 0.3, 1] as const;

/**
 * Visual RSVP attire guide with 3D Filipino lookbook figures.
 */
export function Attire() {
  const wedding = useLanternContent();
  const reduceMotion = useReducedMotion();
  const { dressCode } = wedding.event;
  const [activeRole, setActiveRole] = React.useState(dressCode.roles[0]?.role ?? "");

  const roles = dressCode.roles;
  const activeIndex = Math.max(
    0,
    roles.findIndex((role) => role.role === activeRole),
  );
  const featured = roles[activeIndex] ?? roles[0];

  React.useEffect(() => {
    if (!roles.some((role) => role.role === activeRole) && roles[0]) {
      setActiveRole(roles[0].role);
    }
  }, [roles, activeRole]);

  if (!featured) return null;

  return (
    <section
      id="attire"
      className="relative overflow-hidden lantern-section"
      style={{
        background:
          "linear-gradient(180deg, #fff8f4 0%, #f7ebe7 42%, #fff6f8 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 20% 10%, rgba(245,192,207,0.35), transparent 45%), radial-gradient(ellipse at 80% 20%, rgba(239,226,201,0.45), transparent 40%), radial-gradient(ellipse at 50% 90%, rgba(232,130,154,0.18), transparent 50%)",
        }}
      />
      <MagicDust count={12} intensity="soft" className="opacity-35" />
      <SceneAtmosphere tone="lantern-rose" className="opacity-35" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: LUXURY }}
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <p className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.42em] text-lantern-rose">
            {dressCode.eyebrow}
          </p>

          <div className="mt-4 flex items-center gap-4 sm:mt-5 sm:gap-5">
            <span
              aria-hidden
              className="h-px w-8 bg-gradient-to-r from-transparent to-lantern/70 sm:w-12"
            />
            <h2 className="font-display text-[2.15rem] font-light leading-[1.08] tracking-[-0.02em] text-ink min-[380px]:text-[2.5rem] sm:text-5xl lg:text-6xl">
              {dressCode.title}
            </h2>
            <span
              aria-hidden
              className="h-px w-8 bg-gradient-to-l from-transparent to-lantern/70 sm:w-12"
            />
          </div>

          <div className="mx-auto mt-5 h-px w-16 bg-gradient-to-r from-transparent via-lantern-rose/70 to-transparent sm:mt-6 sm:w-24" />

          <p className="mt-5 max-w-xl font-serif text-base italic leading-relaxed text-ink/75 sm:mt-6 sm:text-xl sm:leading-[1.7]">
            {dressCode.note}
          </p>

          <div className="mt-6 flex items-center gap-3 sm:mt-7">
            <span
              aria-hidden
              className="hidden h-px w-10 bg-lantern-rose/35 sm:block"
            />
            <p className="font-cinzel text-[11px] font-semibold uppercase tracking-[0.34em] text-lantern-rose sm:text-xs sm:tracking-[0.38em]">
              {dressCode.restriction}
            </p>
            <span
              aria-hidden
              className="hidden h-px w-10 bg-lantern-rose/35 sm:block"
            />
          </div>
        </motion.header>

        <div className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-10">
          <motion.div
            key={`${featured.role}-${featured.imageSrc}`}
            initial={reduceMotion ? false : { opacity: 0.35, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: LUXURY }}
            className="overflow-hidden rounded-[1.75rem] border border-lantern-rose/20 bg-cream shadow-[0_28px_70px_-40px_rgba(96,40,60,0.45)]"
          >
            <div className="relative aspect-[4/5] w-full sm:aspect-[3/4]">
              <Image
                key={featured.imageSrc}
                src={featured.imageSrc}
                alt={featured.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover object-[50%_18%]"
                priority={false}
              />
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-lantern-rose/15 bg-cream px-5 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0 text-left">
                <p className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.32em] text-lantern-rose">
                  Lookbook
                </p>
                <h3 className="mt-1 font-display text-2xl font-light text-ink sm:text-3xl">
                  {featured.role}
                </h3>
                <p className="mt-1 font-serif text-sm italic text-ink/70 sm:text-base">
                  {featured.attire}
                </p>
              </div>
              <span
                aria-hidden
                className="h-12 w-12 shrink-0 rounded-md shadow-sm ring-1 ring-lantern-rose/25 sm:h-14 sm:w-14"
                style={{ background: featured.swatch }}
                title={`${featured.role} fabric`}
              />
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {roles.map((item, index) => {
              const selected = item.role === featured.role;
              return (
                <motion.button
                  key={item.role}
                  type="button"
                  onClick={() => setActiveRole(item.role)}
                  initial={reduceMotion ? false : { opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.7,
                    ease: LUXURY,
                    delay: index * 0.06,
                  }}
                  className={cn(
                    "group relative overflow-hidden rounded-[1.25rem] border text-left transition duration-500",
                    selected
                      ? "border-lantern/55 bg-cream shadow-[0_18px_40px_-28px_rgba(192,96,122,0.65)] ring-1 ring-lantern/30"
                      : "border-lantern-rose/20 bg-cream/65 hover:border-lantern-rose/40 hover:bg-cream/90",
                    index === roles.length - 1 && roles.length % 2 === 1
                      ? "col-span-2 sm:col-span-1"
                      : "",
                  )}
                  aria-pressed={selected}
                >
                  <div className="relative aspect-[5/4] w-full overflow-hidden">
                    <Image
                      src={item.imageSrc}
                      alt={item.imageAlt}
                      fill
                      sizes="(max-width: 1024px) 50vw, 280px"
                      className={cn(
                        "object-cover object-[50%_20%] transition duration-700",
                        selected ? "scale-105" : "group-hover:scale-105",
                      )}
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-night/50 via-night/5 to-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-3 px-3.5 py-3 sm:px-4 sm:py-3.5">
                    <span
                      aria-hidden
                      className="h-7 w-7 shrink-0 rounded-sm shadow-sm ring-1 ring-lantern-rose/25"
                      style={{ background: item.swatch }}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-display text-lg font-medium text-ink sm:text-xl">
                        {item.role}
                      </p>
                      <p className="truncate font-serif text-xs italic text-ink/65 sm:text-sm">
                        {item.attire}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5 sm:mt-12">
          {roles.map((item) => (
            <button
              key={`palette-${item.role}`}
              type="button"
              onClick={() => setActiveRole(item.role)}
              title={item.role}
              aria-label={`Show ${item.role} attire`}
              className={cn(
                "h-8 w-8 rounded-full transition sm:h-9 sm:w-9",
                item.role === featured.role
                  ? "ring-2 ring-lantern ring-offset-2 ring-offset-[#fff6f8]"
                  : "opacity-85 hover:opacity-100",
              )}
              style={{
                background: item.swatch,
                border: "1px solid rgba(232,130,154,0.3)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
