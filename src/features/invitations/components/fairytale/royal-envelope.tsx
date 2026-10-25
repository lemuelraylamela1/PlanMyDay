"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { fairytaleEase } from "@/features/invitations/components/fairytale/use-reveal";
import {
  Fleuron,
  displayFont,
  scriptFont,
  smallCaps,
} from "@/features/invitations/components/fairytale/ornaments";
import {
  grainOverlay,
  pageParchment,
  stoneBackground,
  waxSealBackground,
} from "@/features/invitations/components/fairytale/textures";

interface Props {
  guestName: string;
  coupleNames: string;
  monogram: string;
  dateLabel: string | null;
  /** Fires on the open click (same gesture browsers need to start audio). */
  onOpenStart?: () => void;
  onOpened: () => void;
}

const OPEN_SEQUENCE_MS = 3500;
/** Moment the flap passes vertical; from here it must render behind the rising card. */
const FLAP_EDGE_ON_MS = 750;

export function RoyalEnvelope({
  guestName,
  coupleNames,
  monogram,
  dateLabel,
  onOpenStart,
  onOpened,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [opening, setOpening] = React.useState(false);
  const [flapOpen, setFlapOpen] = React.useState(false);

  React.useEffect(() => {
    if (!opening) return;
    const flapTimer = window.setTimeout(() => setFlapOpen(true), FLAP_EDGE_ON_MS);
    const doneTimer = window.setTimeout(onOpened, OPEN_SEQUENCE_MS);
    return () => {
      window.clearTimeout(flapTimer);
      window.clearTimeout(doneTimer);
    };
  }, [opening, onOpened]);

  function openEnvelope() {
    if (opening) return;
    onOpenStart?.();
    if (reduceMotion) {
      onOpened();
      return;
    }
    setOpening(true);
  }

  return (
    <section className="relative flex h-full min-h-[100svh] items-center justify-center overflow-hidden px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
      <ChamberBackdrop animate={!reduceMotion && !opening} opening={opening} />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center">
        <motion.button
          type="button"
          onClick={openEnvelope}
          aria-disabled={opening}
          aria-label={`Open your invitation, ${guestName}`}
          className="group relative mx-auto block aspect-[16/10] w-[min(92vw,26rem)] select-none focus-visible:outline-none"
          style={{ perspective: "1400px" }}
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: fairytaleEase, delay: 0.15 }}
          whileTap={opening || reduceMotion ? undefined : { scale: 0.992 }}
        >
          <motion.span
            className="absolute inset-0 block"
            initial={false}
            animate={{ y: opening ? "90%" : "0%" }}
            transition={{ duration: 2.3, ease: fairytaleEase, delay: opening ? 0.55 : 0 }}
          >
            <span
              aria-hidden
              className="absolute -bottom-8 left-[4%] z-0 block h-14 w-[92%] rounded-[50%] bg-black/60 blur-3xl"
            />

            <EnvelopeShell opening={opening} className="z-0">
              <EnvelopeBack opening={opening} />
            </EnvelopeShell>

            <InvitationCard
              opening={opening}
              guestName={guestName}
              coupleNames={coupleNames}
              monogram={monogram}
              dateLabel={dateLabel}
            />

            <EnvelopeShell opening={opening} className="z-20">
              <EnvelopeFront guestName={guestName} opening={opening} />
            </EnvelopeShell>

            <EnvelopeShell
              opening={opening}
              className={flapOpen ? "z-[5]" : "z-30"}
              style={{ perspective: "1400px" }}
            >
              <EnvelopeFlap opening={opening} />
            </EnvelopeShell>

            <span className="absolute left-1/2 top-[52%] z-40 block -translate-x-1/2 -translate-y-1/2">
              <WaxSeal monogram={monogram} opening={opening} />
            </span>
          </motion.span>

          <span
            aria-hidden
            className={cn(
              "absolute -inset-3 z-50 border border-[#DDBF8D]/80 opacity-0 transition-opacity",
              !opening && "group-focus-visible:opacity-100",
            )}
          />
        </motion.button>

        <motion.div
          className="mt-10 flex flex-col items-center gap-2 text-center sm:mt-12"
          initial={false}
          animate={opening ? { opacity: 0, y: 8 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <p className={cn(smallCaps, "text-[8px] text-[#DDBF8D]/75 sm:text-[10px]")}>
            A private invitation awaits
          </p>
          <button
            type="button"
            onClick={openEnvelope}
            disabled={opening}
            className={cn(
              displayFont,
              "text-lg italic text-[#F3E7D3] underline decoration-[#DDBF8D]/50 underline-offset-[6px] transition-colors hover:text-[#DDBF8D] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DDBF8D] focus-visible:ring-offset-4 focus-visible:ring-offset-[#1d1820]",
            )}
          >
            Open your invitation
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function EnvelopeShell({
  opening,
  className,
  style,
  children,
}: {
  opening: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <motion.span
      className={cn("absolute inset-0 block", className)}
      style={style}
      animate={
        opening
          ? { y: [0, 4, 22], opacity: [1, 1, 0], scale: [1, 1, 0.94] }
          : { y: 0, opacity: 1, scale: 1 }
      }
      transition={{
        duration: 1.15,
        ease: fairytaleEase,
        delay: opening ? 2.05 : 0,
        times: [0, 0.35, 1],
      }}
    >
      {children}
    </motion.span>
  );
}

function InvitationCard({
  opening,
  guestName,
  coupleNames,
  monogram,
  dateLabel,
}: {
  opening: boolean;
  guestName: string;
  coupleNames: string;
  monogram: string;
  dateLabel: string | null;
}) {
  return (
    <motion.span
      className="absolute left-[7%] top-[7%] z-10 block h-[86%] w-[86%] overflow-hidden text-[#4a3236] shadow-[0_18px_36px_rgba(0,0,0,0.35)]"
      style={{ backgroundImage: pageParchment }}
      initial={false}
      animate={
        opening
          ? {
              opacity: 1,
              y: ["0%", "0%", "-110%", "-110%"],
              scale: [1, 1, 1, 1.14],
            }
          : { opacity: 0, y: "0%", scale: 1 }
      }
      transition={{
        duration: 2.7,
        ease: fairytaleEase,
        delay: opening ? 0.45 : 0,
        times: [0, 0.12, 0.58, 1],
        opacity: { duration: 0.01, delay: opening ? 0.3 : 0 },
      }}
    >
      <span aria-hidden className="absolute inset-1.5 border border-[#C9A66B]/65 sm:inset-2.5" />
      <span aria-hidden className="absolute inset-2.5 border border-[#C9A66B]/25 sm:inset-3.5" />
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 65% 58% at 50% 44%,rgba(255,239,199,0.45),transparent 78%)",
        }}
      />

      <span className="absolute inset-0 flex flex-col items-center justify-center px-4 py-3 text-center sm:px-6 sm:py-5">
        <motion.span
          initial={false}
          animate={opening ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.65, ease: fairytaleEase, delay: opening ? 1.2 : 0 }}
          className={cn(displayFont, "text-lg font-light leading-none text-[#B76E79] sm:text-2xl")}
        >
          {monogram}
        </motion.span>
        <motion.span
          initial={false}
          animate={opening ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.65, ease: fairytaleEase, delay: opening ? 1.32 : 0 }}
          className="my-1.5 hidden sm:my-2 sm:block"
        >
          <Fleuron className="w-20" />
        </motion.span>
        <motion.span
          initial={false}
          animate={opening ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.7, ease: fairytaleEase, delay: opening ? 1.42 : 0 }}
          className={cn(smallCaps, "mt-1.5 text-[6px] text-[#9b7b62] sm:mt-0 sm:text-[8px]")}
        >
          Together with their families
        </motion.span>
        <motion.span
          initial={false}
          animate={opening ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: 0.8, ease: fairytaleEase, delay: opening ? 1.55 : 0 }}
          className={cn(
            displayFont,
            "mt-1.5 max-w-[16rem] text-balance text-[clamp(1.15rem,4.6vw,1.9rem)] font-light leading-[1] sm:mt-2",
          )}
        >
          {coupleNames}
        </motion.span>
        <motion.span
          initial={false}
          animate={opening ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.65, delay: opening ? 1.75 : 0 }}
          className={cn(scriptFont, "mt-1 max-w-full truncate text-base text-[#B76E79] sm:mt-2 sm:text-lg")}
        >
          invite {guestName}
        </motion.span>
        {dateLabel && (
          <motion.span
            initial={false}
            animate={opening ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.65, delay: opening ? 1.88 : 0 }}
            className={cn(smallCaps, "mt-1.5 text-[6px] text-[#9b7b62] sm:mt-3 sm:text-[8px]")}
          >
            {dateLabel}
          </motion.span>
        )}
      </span>
    </motion.span>
  );
}

function EnvelopeBack({ opening }: { opening: boolean }) {
  return (
    <>
      <span
        className="absolute inset-0 z-0 block rounded-sm shadow-[0_26px_55px_rgba(0,0,0,0.5)]"
        style={{
          backgroundImage: "linear-gradient(145deg,#f6ead3 0%,#fffaf0 48%,#e2cba5 100%)",
        }}
      />
      <motion.span
        aria-hidden
        className="absolute inset-x-[2%] top-[2%] z-[5] block h-[48%] origin-top"
        style={{
          clipPath: "polygon(0 0,100% 0,50% 100%)",
          backgroundImage: "linear-gradient(150deg,#c78999 0%,#E8B8C7 46%,#b97889 100%)",
        }}
        initial={false}
        animate={opening ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.25, delay: opening ? 0.28 : 0 }}
      >
        <span
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,transparent 0 10px,rgba(255,255,255,0.22) 10px 11px)",
          }}
        />
      </motion.span>
    </>
  );
}

function EnvelopeFlap({ opening }: { opening: boolean }) {
  return (
    <motion.span
      aria-hidden
      className="absolute inset-x-0 top-0 block h-[52%] origin-top"
      style={{
        clipPath: "polygon(0 0,100% 0,50% 100%)",
        backgroundImage: "linear-gradient(165deg,#fff9ed 0%,#ead8b9 62%,#c9aa78 100%)",
      }}
      initial={false}
      animate={
        opening
          ? {
              rotateX: [0, -18, -178],
              filter: ["brightness(1)", "brightness(1.08)", "brightness(0.82)"],
            }
          : { rotateX: 0, filter: "brightness(1)" }
      }
      transition={{ duration: 1.05, ease: fairytaleEase, delay: opening ? 0.28 : 0, times: [0, 0.22, 1] }}
    >
      <span className="absolute inset-4 border-t border-[#C9A66B]/45" />
    </motion.span>
  );
}

function EnvelopeFront({ guestName, opening }: { guestName: string; opening: boolean }) {
  return (
    <span className="absolute inset-0 z-20 block overflow-hidden rounded-sm">
      {/* Pocket face: V-cut so the card can slide out from the open top */}
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          clipPath: "polygon(0 0,50% 46%,100% 0,100% 100%,0 100%)",
          backgroundImage: "linear-gradient(160deg,#f5e8cf 0%,#fffaf0 48%,#dfc69e 100%)",
        }}
      />
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(28deg,transparent 49.7%,rgba(155,123,98,0.28) 50%,transparent 50.4%),linear-gradient(-28deg,transparent 49.7%,rgba(155,123,98,0.28) 50%,transparent 50.4%)",
          clipPath: "polygon(0 0,50% 46%,100% 0,100% 100%,0 100%)",
        }}
      />
      <motion.span
        className="absolute inset-x-[14%] bottom-[10%] text-center text-[#6d4a50]"
        initial={false}
        animate={opening ? { opacity: 0, y: 8 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <span className={cn(smallCaps, "block text-[7px] text-[#9b7b62] sm:text-[9px]")}>
          Hand delivered for
        </span>
        <span className={cn(displayFont, "mt-1.5 block truncate text-lg italic sm:text-xl")}>
          {guestName}
        </span>
      </motion.span>
    </span>
  );
}

function WaxSeal({ monogram, opening }: { monogram: string; opening: boolean }) {
  return (
    <motion.span
      className="flex items-center justify-center"
      initial={false}
      animate={
        opening
          ? {
              opacity: [1, 1, 0],
              scale: [1, 1.08, 0.72],
              rotate: [0, -6, 18],
              y: [0, -4, 70],
            }
          : { opacity: 1, scale: 1, rotate: 0, y: 0 }
      }
      transition={{ duration: 0.75, ease: fairytaleEase }}
    >
      <span className="relative flex h-14 w-14 items-center justify-center sm:h-16 sm:w-16">
        <span className="absolute right-1/2 top-[62%] block h-7 w-2.5 origin-top-right rotate-[16deg] bg-[#8f4a57] [clip-path:polygon(0_0,100%_0,100%_100%,50%_82%,0_100%)]" />
        <span className="absolute left-1/2 top-[62%] block h-7 w-2.5 origin-top-left -rotate-[16deg] bg-[#743844] [clip-path:polygon(0_0,100%_0,100%_100%,50%_82%,0_100%)]" />
        <span
          className="relative flex h-full w-full items-center justify-center rounded-[47%_53%_50%_50%/52%_48%_52%_48%] shadow-[0_7px_16px_rgba(0,0,0,0.42),inset_0_-3px_6px_rgba(0,0,0,0.25)]"
          style={{ backgroundImage: waxSealBackground }}
        >
          <span className="absolute inset-[6px] rounded-full border border-[#f3c5cc]/40" />
          <span
            className={cn(
              displayFont,
              "relative max-w-[3rem] truncate text-[11px] font-semibold tracking-wide text-[#fbe3e6] sm:text-xs",
            )}
          >
            {monogram}
          </span>
        </span>
      </span>
    </motion.span>
  );
}

function ChamberBackdrop({ animate, opening }: { animate: boolean; opening: boolean }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      animate={opening ? { opacity: 0.38, scale: 1.025 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 1.4, ease: fairytaleEase, delay: opening ? 2 : 0 }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 52% 45% at 50% 43%,rgba(221,191,141,0.2),transparent 72%),linear-gradient(180deg,#1d1820 0%,#241d22 54%,#120e11 100%)",
        }}
      />
      <div
        className="absolute bottom-0 left-1/2 h-[94svh] w-[min(100vw,52rem)] -translate-x-1/2 rounded-t-full"
        style={{
          backgroundImage: stoneBackground,
          boxShadow: "inset 0 0 100px rgba(0,0,0,0.68)",
        }}
      >
        <div
          className="absolute inset-x-[7%] bottom-0 top-[5%] rounded-t-full"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 50% at 50% 48%,rgba(255,222,172,0.2),transparent 72%),linear-gradient(180deg,#2b2228 0%,#241c21 60%,#191317 100%)",
            boxShadow:
              "inset 0 40px 75px rgba(0,0,0,0.58),inset 0 0 0 1px rgba(221,191,141,0.12)",
          }}
        />
      </div>
      <motion.div
        className="absolute -top-[8%] left-[15%] h-[115%] w-[45%] origin-top -rotate-[16deg] blur-2xl"
        style={{
          backgroundImage:
            "linear-gradient(180deg,rgba(255,232,190,0.3),rgba(255,232,190,0.06) 62%,transparent)",
          clipPath: "polygon(40% 0,60% 0,100% 100%,0 100%)",
        }}
        animate={animate ? { opacity: [0.58, 0.95, 0.58] } : undefined}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      {["left-[9%]", "right-[9%]"].map((position, index) => (
        <div
          key={position}
          className={cn("absolute bottom-[13%] hidden flex-col items-center sm:flex", position)}
        >
          <motion.div
            className="absolute -top-24 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(255,196,120,0.3),transparent_65%)]"
            animate={animate ? { opacity: [0.7, 1, 0.78, 1, 0.7] } : undefined}
            transition={{ duration: 5 + index, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="relative block h-3.5 w-2 rounded-[50%_50%_50%_50%/62%_62%_38%_38%] bg-[#ffd890] shadow-[0_0_14px_4px_rgba(255,200,120,0.55)]" />
          <span className="relative mt-0.5 block h-20 w-3 rounded-sm bg-gradient-to-b from-[#f4ead6] to-[#c9b89a]" />
          <span className="relative block h-1.5 w-8 rounded-full bg-[#8a6f45]" />
        </div>
      ))}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 90% 80% at 50% 45%,transparent 53%,rgba(0,0,0,0.62) 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{ backgroundImage: grainOverlay }}
      />
    </motion.div>
  );
}
