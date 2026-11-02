"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { useExperience } from "../experience/experience-provider";

/**
 * Fixed bottom-left control that scrolls the guest back to the hero.
 * Only appears after the invitation is revealed and the page has been scrolled.
 */
export function BackToTop() {
  const { phase } = useExperience();
  const revealed = phase === "revealed";
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (!revealed) {
      setVisible(false);
      return;
    }

    let ticking = false;
    const update = () => {
      ticking = false;
      setVisible(window.scrollY > 280);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [revealed]);

  const goTop = () => {
    const hero = document.getElementById("hero");
    if (hero) {
      hero.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {revealed && visible && (
        <motion.button
          type="button"
          onClick={goTop}
          initial={{ opacity: 0, y: 14, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.94 }}
          aria-label="Back to top"
          className="invite-fab-bl fixed z-[120] flex h-12 w-12 items-center justify-center rounded-full border border-lantern/55 bg-night/75 text-lantern shadow-[0_0_34px_rgba(244,196,68,0.28)] backdrop-blur-md transition-colors hover:bg-dusk sm:h-14 sm:w-14"
        >
          <ChevronUp className="h-6 w-6" strokeWidth={2.25} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
