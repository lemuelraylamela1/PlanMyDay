"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "center",
  theme = "light",
  className,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "center" | "left";
  /** "light" = cream section, "dark" = night-sky section */
  theme?: "light" | "dark";
  className?: string;
}) {
  const isCenter = align === "center";
  const isDark = theme === "dark";

  return (
    <motion.div
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex flex-col gap-4",
        isCenter ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "font-cinzel text-[10px] font-semibold uppercase tracking-[0.4em]",
            isDark ? "text-[#f5c0cf]" : "text-[#b76e79]",
          )}
        >
          {eyebrow}
        </span>
      )}

      <div
        className={cn(
          "flex items-center gap-4",
          isCenter ? "justify-center" : "justify-start"
        )}
      >
        {isCenter && (
          <span
            className={cn(
              "h-px w-10",
              isDark
                ? "bg-gradient-to-r from-transparent to-lantern/70"
                : "bg-gradient-to-r from-transparent to-[#e8829a]/70"
            )}
          />
        )}
        <h2
          className={cn(
            "max-w-[16ch] font-display text-[1.85rem] font-light leading-[1.15] tracking-[-0.02em] min-[380px]:text-3xl sm:max-w-none sm:text-5xl",
            isDark ? "text-gold-foil" : "text-[#2a1540]"
          )}
        >
          {title}
        </h2>
        {isCenter && (
          <span
            className={cn(
              "h-px w-10",
              isDark
                ? "bg-gradient-to-l from-transparent to-lantern/70"
                : "bg-gradient-to-l from-transparent to-[#e8829a]/70"
            )}
          />
        )}
      </div>

      {intro && (
        <p
          className={cn(
            "max-w-2xl px-1 font-serif text-base leading-[1.75] sm:text-xl sm:leading-[1.85]",
            isCenter ? "mx-auto" : "",
            isDark ? "text-[#f5c0cf]/90" : "text-[#2a1540]/75",
          )}
        >
          {intro}
        </p>
      )}
    </motion.div>
  );
}
