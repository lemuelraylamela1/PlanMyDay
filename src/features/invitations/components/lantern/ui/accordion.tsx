"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type AccordionItemData = {
  question: string;
  answer: string;
};

export function Accordion({
  items,
  className,
  theme = "light",
}: {
  items: AccordionItemData[];
  className?: string;
  theme?: "light" | "dark";
}) {
  const [open, setOpen] = React.useState<number | null>(0);
  const isDark = theme === "dark";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className={cn(
              "overflow-hidden rounded-2xl border transition-colors duration-500",
              isDark
                ? isOpen
                  ? "border-lantern/40 bg-dusk/80 backdrop-blur-md"
                  : "border-lantern/15 bg-dusk/40 backdrop-blur-sm"
                : isOpen
                ? "border-lantern-rose/30 bg-cream"
                : "border-lantern-rose/15 bg-cream/70"
            )}
          >
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lantern"
              >
                <span
                  className={cn(
                    "font-display text-lg font-semibold sm:text-xl",
                    isDark ? "text-cream" : "text-ink"
                  )}
                >
                  {item.question}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 135 : 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                    isDark
                      ? "border-lantern/50 text-lantern"
                      : "border-lantern-rose/40 text-lantern-rose"
                  )}
                >
                  <Plus className="h-4 w-4" />
                </motion.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p
                    className={cn(
                      "px-6 pb-6 font-serif text-[1.05rem] leading-[1.9]",
                      isDark ? "text-blush/85" : "text-ink/80"
                    )}
                  >
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
