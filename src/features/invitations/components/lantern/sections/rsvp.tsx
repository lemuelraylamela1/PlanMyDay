"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Beef,
  CalendarHeart,
  Check,
  CircleAlert,
  Drumstick,
  Fish,
  Heart,
  HeartCrack,
  Leaf,
  Loader2,
  Pencil,
  Salad,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useLanternContent } from "../content-context";
import { useExperience } from "../experience/experience-provider";
import { MagicDust } from "../effects/magic-dust";
import { SparkleBurst } from "../effects/sparkle-burst";
import { FloatingLanterns } from "../effects/floating-lanterns";
import { SceneAtmosphere } from "../effects/scene-atmosphere";
import { GoldButton } from "../ui/gold-button";
import { OrnateScroll } from "../ui/ornate-scroll";
import { scrollToSection } from "../hooks/scroll-to-section";
import type { InvitationCheckIn, InvitationGuest, InvitationResponse, RsvpStatusValue } from "../types";
import { GuestCheckInQrCard } from "@/features/check-in/components/guest-check-in-qr-card";
import {
  joinRsvpMessage,
  splitRsvpMessage,
} from "@/features/invitations/rsvp-message";

const LUXURY = [0.16, 1, 0.3, 1] as const;

// Small caps eyebrow only for the section title; form labels use readable sentence case.
const eyebrowCls =
  "font-cinzel text-[12px] font-semibold uppercase tracking-[0.2em] text-[#5c3a12] sm:tracking-[0.28em]";
const fieldLabelCls = "font-serif text-[1.05rem] font-semibold leading-snug text-[#2a1540]";
const inputCls =
  "w-full rounded-xl border border-[#b8860b]/40 bg-[#fffaf0] px-3.5 py-3.5 font-serif text-[1.08rem] leading-relaxed text-[#2a1540] outline-none transition placeholder:text-[#2a1540]/45 focus:border-[#b8860b]/70 focus:ring-2 focus:ring-[#b8860b]/25 min-[380px]:px-4";
const bodyCls = "font-serif text-[1.05rem] leading-[1.75] text-[#2a1540] sm:text-[1.1rem] sm:leading-[1.85]";
const mutedCls = "font-serif text-[1.02rem] leading-relaxed text-[#3a2410]";

const statusHeadline: Record<Exclude<RsvpStatusValue, "PENDING">, string> = {
  ACCEPTED: "Joyfully accepted",
  DECLINED: "Regretfully declined",
  TENTATIVE: "Noted as tentative",
};

interface Props {
  token?: string | null;
  guest?: InvitationGuest | null;
  response?: InvitationResponse | null;
  monogram?: string;
}

export function Rsvp({ token, guest, response }: Props) {
  const wedding = useLanternContent();
  const { invitationToken, rsvpOpen, openRsvp } = useExperience();
  const effectiveToken = token ?? invitationToken;

  const mealChoices: readonly string[] = wedding.rsvp.mealOptions;
  const guestName = guest?.name ?? "Guest";
  const plusOneAllowed = guest?.plusOneAllowed ?? false;

  const [status, setStatus] = React.useState<RsvpStatusValue>(guest?.rsvpStatus ?? "PENDING");
  const [savedResponse, setSavedResponse] = React.useState<InvitationResponse | null>(response ?? null);
  const [editing, setEditing] = React.useState((guest?.rsvpStatus ?? "PENDING") === "PENDING");
  const [justSubmitted, setJustSubmitted] = React.useState(false);

  const [attending, setAttending] = React.useState<boolean | null>(response?.attending ?? null);
  // Multi-select. Stored in the existing mealPreference text column as
  // "Beef, Chicken" so dashboards, exports and seating keep working unchanged.
  const [meals, setMeals] = React.useState<string[]>(() =>
    parseMeals(response?.mealPreference, mealChoices),
  );

  function toggleMeal(meal: string) {
    setError(null);
    setMeals((current) => {
      const isNoPref = meal.toLowerCase() === NO_PREFERENCE.toLowerCase();
      if (current.includes(meal)) return current.filter((m) => m !== meal);
      // "No preference" is exclusive: it clears dishes, and a dish clears it.
      if (isNoPref) return [meal];
      return [...current.filter((m) => m.toLowerCase() !== NO_PREFERENCE.toLowerCase()), meal];
    });
  }
  const [dietaryRestrictions, setDietaryRestrictions] = React.useState(
    response?.dietaryRestrictions ?? "",
  );
  const [plusOneName, setPlusOneName] = React.useState(response?.plusOneName ?? "");
  const initialMessage = splitRsvpMessage(response?.message);
  const [message, setMessage] = React.useState(initialMessage.note);
  const [suggestedHashtags, setSuggestedHashtags] = React.useState(
    initialMessage.hashtags,
  );
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [checkIn, setCheckIn] = React.useState<InvitationCheckIn | null>(guest?.checkIn ?? null);

  function loadResponse(next: InvitationResponse | null) {
    const parts = splitRsvpMessage(next?.message);
    setAttending(next?.attending ?? null);
    setMeals(parseMeals(next?.mealPreference, mealChoices));
    setDietaryRestrictions(next?.dietaryRestrictions ?? "");
    setPlusOneName(next?.plusOneName ?? "");
    setMessage(parts.note);
    setSuggestedHashtags(parts.hashtags);
  }

  function startChange() {
    openRsvp();
    loadResponse(savedResponse);
    setError(null);
    setJustSubmitted(false);
    setEditing(true);
  }

  function keepCurrentReply() {
    loadResponse(savedResponse);
    setError(null);
    setEditing(false);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!effectiveToken) {
      setError("This RSVP form requires a personalized invitation link.");
      return;
    }
    if (attending === null) {
      setError("Please let us know if you can make it.");
      return;
    }
    if (attending && meals.length === 0) {
      setError("Please choose at least one meal.");
      return;
    }
    // Canonical order (as listed on the card), regardless of tap order.
    const mealPreference = mealChoices.filter((m) => meals.includes(m)).join(", ");

    const reply: InvitationResponse = {
      attending,
      partySize: attending && plusOneAllowed && plusOneName.trim() ? 2 : 1,
      mealPreference: attending ? mealPreference : null,
      dietaryRestrictions: attending ? dietaryRestrictions.trim() || null : null,
      plusOneName: attending && plusOneAllowed ? plusOneName.trim() || null : null,
      message: joinRsvpMessage(message, suggestedHashtags),
    };

    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/public/invitation-rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: effectiveToken,
          attending: reply.attending,
          partySize: reply.partySize,
          mealPreference: reply.mealPreference ?? "",
          dietaryRestrictions: reply.dietaryRestrictions ?? "",
          plusOneName: reply.plusOneName ?? "",
          message: reply.message ?? "",
        }),
      });

      const payload = (await res.json().catch(() => null)) as
        | {
            success?: boolean;
            message?: string;
            error?: string;
            checkIn?: InvitationCheckIn;
          }
        | null;

      if (!res.ok || !payload?.success) {
        const failure =
          payload?.error ||
          (res.status === 404
            ? "This invitation link is invalid or has been replaced."
            : "We couldn't send your reply. Please try again.");
        setError(failure);
        toast.error(failure);
        return;
      }

      setStatus(reply.attending ? "ACCEPTED" : "DECLINED");
      setSavedResponse(reply);
      setCheckIn(reply.attending ? payload.checkIn ?? null : null);
      setJustSubmitted(true);
      setEditing(false);
      openRsvp();

      // Bring the thank-you / receipt to the top of the viewport after submit.
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          scrollToSection("rsvp", {
            duration: window.matchMedia("(max-width: 639px)").matches ? 900 : 1100,
            offset: 0,
          });
        }, 60);
      });
    } catch {
      const failure = "We couldn't send your reply. Please check your connection and try again.";
      setError(failure);
      toast.error(failure);
    } finally {
      setPending(false);
    }
  }

  const showSuccess = !editing && status !== "PENDING";

  // Form only after "RSVP Now"; receipt always stays on the main site once replied.
  if (!rsvpOpen && !showSuccess) {
    return null;
  }

  // Steps renumber themselves: declining skips the meal step.
  const mealStep = attending === true ? 2 : null;
  const noteStep = attending === true ? 3 : 2;

  return (
    <section
      id="rsvp"
      className="relative overflow-hidden lantern-section"
      style={{
        background: "linear-gradient(180deg, #07040f 0%, #120a22 45%, #1a0f2e 100%)",
      }}
    >
      <MagicDust count={18} intensity="soft" className="opacity-45" />
      <FloatingLanterns count={7} intensity="ambient" className="opacity-35" />
      <SceneAtmosphere tone="night" className="opacity-40" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-20 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-lantern/10 blur-3xl"
      />
      <div aria-hidden className="scroll-vignette pointer-events-none absolute inset-0 opacity-80" />

      <div className="relative z-10 mx-auto max-w-2xl px-2.5 min-[380px]:px-3 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.95, ease: LUXURY }}
          className="relative"
        >
          <OrnateScroll>
            <header className="mb-7 flex flex-col items-center text-center sm:mb-9">
              <p className={eyebrowCls}>{wedding.rsvp.eyebrow}</p>
              <h2 className="mt-3 font-display text-[2.1rem] font-medium leading-[1.08] tracking-[-0.02em] text-[#2a1540] min-[380px]:text-[2.5rem] sm:text-5xl">
                {wedding.rsvp.title}
              </h2>
              <Divider />
              <p className={cn("max-w-md", bodyCls)}>{wedding.rsvp.intro}</p>
              <p className="mt-5 inline-flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 rounded-full border border-[#b8860b]/35 bg-[#fffaf0]/85 px-4 py-2 font-serif text-[1rem] text-[#3a2410] shadow-[0_2px_8px_-6px_rgba(74,47,12,0.4)]">
                <CalendarHeart className="h-4 w-4 shrink-0 text-[#8b3a4a]" aria-hidden />
                Kindly respond by
                <span className="font-semibold text-[#2a1540]">{wedding.rsvp.deadline}</span>
              </p>
            </header>

            <AnimatePresence mode="wait">
              {showSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: LUXURY }}
                  className="relative flex flex-col items-center py-2 text-center sm:py-4"
                  role="status"
                  aria-live="polite"
                >
                  <SparkleBurst />
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 14 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full text-[#3a2410] sm:h-20 sm:w-20"
                    style={{
                      background: "linear-gradient(135deg, #f0d089, #c4893a)",
                      boxShadow: "0 0 32px rgba(196,137,58,0.45)",
                    }}
                  >
                    {status === "DECLINED" ? (
                      <Heart className="h-8 w-8 sm:h-9 sm:w-9" />
                    ) : (
                      <Check className="h-8 w-8 sm:h-9 sm:w-9" />
                    )}
                  </motion.span>
                  <h3 className="mt-5 font-display text-[2rem] font-medium leading-tight text-[#2a1540] sm:text-4xl">
                    {justSubmitted ? "Thank you!" : statusHeadline[status]}
                  </h3>
                  <p className={cn("mt-3 max-w-md", bodyCls)}>
                    {status === "DECLINED"
                      ? "We'll miss you dearly, but we're so grateful you let us know. Sending love your way."
                      : "Your response has been received. We can't wait to celebrate our happily ever after with you!"}
                  </p>

                  {status === "ACCEPTED" && savedResponse && (
                    <dl className="mt-6 w-full max-w-sm divide-y divide-[#b8860b]/15 overflow-hidden rounded-2xl border border-[#b8860b]/25 bg-[#fffaf0]/85 text-left shadow-[0_6px_18px_-12px_rgba(74,47,12,0.45)]">
                      <SummaryRow label="Attending" value="Yes, joyfully" />
                      <SummaryRow
                        label="Meal"
                        value={savedResponse.mealPreference || "To be confirmed"}
                      />
                      {savedResponse.plusOneName ? (
                        <SummaryRow label="Plus one" value={savedResponse.plusOneName} />
                      ) : null}
                      {savedResponse.dietaryRestrictions ? (
                        <SummaryRow
                          label="Dietary needs"
                          value={savedResponse.dietaryRestrictions}
                        />
                      ) : null}
                    </dl>
                  )}

                  {status === "ACCEPTED" && checkIn ? (
                    <GuestCheckInQrCard
                      qrDataUrl={checkIn.qrDataUrl}
                      fullName={checkIn.fullName}
                      downloadUrl={checkIn.downloadUrl}
                      variant="invite"
                    />
                  ) : null}

                  <div className="mt-6 flex items-center gap-2 font-serif text-[1.1rem] italic text-[#5c3a12]">
                    <Heart className="h-4 w-4" aria-hidden />
                    {wedding.meta.hashtag}
                  </div>
                  <button
                    type="button"
                    onClick={startChange}
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#b8860b]/45 bg-[#fffaf0]/70 px-5 py-2.5 font-serif text-[1rem] font-semibold text-[#3a2410] transition hover:border-[#b8860b] hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8860b]/45"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                    Change my response
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={submit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-4 sm:gap-5"
                  noValidate
                >
                  {/* Who is replying + current status — replaces the disabled name input. */}
                  <div className="flex flex-col items-center gap-2 text-center">
                    <p className={mutedCls}>
                      {status !== "PENDING" ? "Updating the reply for" : "Replying as"}
                    </p>
                    <p className="inline-flex items-center gap-2 rounded-full bg-[#2a1540] px-4 py-1.5 font-serif text-[1.08rem] font-semibold text-[#fff4d2] shadow-[0_6px_16px_-10px_rgba(42,21,64,0.8)]">
                      <Sparkles className="h-4 w-4 text-[#f0d089]" aria-hidden />
                      {guestName}
                    </p>
                    {status !== "PENDING" && (
                      <p className={cn("max-w-sm", mutedCls)}>
                        Your current reply is{" "}
                        <span className="font-semibold text-[#2a1540]">
                          {statusHeadline[status].toLowerCase()}
                        </span>
                        . Sending this form will replace it.
                      </p>
                    )}
                  </div>

                  <Step number={1} id="step-attend" title="Will you attend?" hint="Tap one option.">
                    <div
                      role="radiogroup"
                      aria-labelledby="step-attend"
                      className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 sm:gap-3"
                    >
                      <RadioCard
                        icon={Heart}
                        label="Joyfully accept"
                        description="I'll be there!"
                        checked={attending === true}
                        onSelect={() => {
                          setAttending(true);
                          setError(null);
                        }}
                      />
                      <RadioCard
                        icon={HeartCrack}
                        label="Regretfully decline"
                        description="Celebrating in spirit"
                        checked={attending === false}
                        onSelect={() => {
                          setAttending(false);
                          setError(null);
                        }}
                      />
                    </div>
                  </Step>

                  <AnimatePresence initial={false}>
                    {mealStep !== null && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: LUXURY }}
                        className="overflow-hidden"
                      >
                        <Step
                          number={mealStep}
                          id="step-meal"
                          title="Choose your meal"
                          hint="Pick one or more. Tap again to remove."
                        >
                          <div
                            role="group"
                            aria-labelledby="step-meal"
                            className="grid grid-cols-2 gap-2.5 sm:gap-3"
                          >
                            {mealChoices.map((meal, i) => (
                              <MealOption
                                key={meal}
                                label={meal}
                                selected={meals.includes(meal)}
                                // Odd one out spans the full row so the grid stays balanced.
                                wide={mealChoices.length % 2 === 1 && i === mealChoices.length - 1}
                                onSelect={() => toggleMeal(meal)}
                              />
                            ))}
                          </div>
                          {meals.length > 1 ? (
                            <p className={cn("mt-2.5 text-center", mutedCls)}>
                              {meals.length} meals selected
                            </p>
                          ) : null}

                          <div className="mt-5 flex flex-col gap-5">
                            <Field label="Allergies or dietary needs" htmlFor="dietary" optional>
                              <input
                                id="dietary"
                                type="text"
                                value={dietaryRestrictions}
                                onChange={(e) => setDietaryRestrictions(e.target.value)}
                                placeholder="e.g. no nuts, halal, gluten-free"
                                className={inputCls}
                              />
                            </Field>

                            {plusOneAllowed && (
                              <Field
                                label="Your plus one's name"
                                htmlFor="plusOneName"
                                optional
                                hint="Leave blank if you're coming alone."
                              >
                                <input
                                  id="plusOneName"
                                  type="text"
                                  autoComplete="off"
                                  value={plusOneName}
                                  onChange={(e) => setPlusOneName(e.target.value)}
                                  placeholder="Full name"
                                  className={inputCls}
                                />
                              </Field>
                            )}
                          </div>
                        </Step>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {attending !== null && (
                    <Step
                      number={noteStep}
                      id="step-note"
                      title="A note for the couple"
                      hint="Optional. Share a wish, a song request or a hashtag idea."
                    >
                      <div className="flex flex-col gap-5">
                        <Field label="Message or special request" htmlFor="message" optional>
                          <textarea
                            id="message"
                            rows={3}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Write your wishes or a song request..."
                            className={cn(inputCls, "resize-none")}
                          />
                        </Field>

                        <Field label="Suggest a wedding hashtag" htmlFor="suggestedHashtags" optional>
                          <input
                            id="suggestedHashtags"
                            type="text"
                            autoCapitalize="off"
                            value={suggestedHashtags}
                            onChange={(e) => setSuggestedHashtags(e.target.value)}
                            placeholder="#OurHappilyEverAfter"
                            className={inputCls}
                          />
                        </Field>
                      </div>
                    </Step>
                  )}

                  {error && (
                    <div
                      role="alert"
                      className="flex items-start gap-2.5 rounded-xl border border-[#8b1a1a]/25 bg-[#fdeeee] px-4 py-3 text-left text-[#7a1616]"
                    >
                      <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                      <p className="font-serif text-[1.02rem] font-medium leading-snug">{error}</p>
                    </div>
                  )}
                  {!effectiveToken && (
                    <p className={cn("text-center italic", mutedCls)}>
                      Preview mode: open a personalized invitation link to submit RSVP.
                    </p>
                  )}

                  <div className="mt-1 flex flex-col items-center gap-3">
                    <GoldButton
                      type="submit"
                      size="lg"
                      disabled={pending || attending === null || !effectiveToken}
                      className="w-full text-[0.85rem] tracking-[0.16em] sm:text-sm"
                    >
                      {pending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : status === "PENDING" ? (
                        "Send My RSVP"
                      ) : (
                        "Update My RSVP"
                      )}
                    </GoldButton>
                    {attending === null && !pending && (
                      <p className={cn("text-center", mutedCls)}>
                        Choose whether you&apos;ll attend to continue.
                      </p>
                    )}

                    {status !== "PENDING" && (
                      <button
                        type="button"
                        onClick={keepCurrentReply}
                        disabled={pending}
                        className="rounded-full px-4 py-2 font-serif text-[1rem] font-semibold text-[#3a2410] underline decoration-[#b8860b]/50 underline-offset-4 transition hover:text-[#2a1540]"
                      >
                        Keep my current reply
                      </button>
                    )}
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </OrnateScroll>

          <AnimatePresence>
            {showSuccess && justSubmitted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 -z-0"
              >
                <FloatingLanterns count={12} intensity="festival" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

function Divider() {
  return (
    <div aria-hidden className="my-4 flex items-center gap-3 text-[#b8860b]">
      <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#b8860b]/60 sm:w-16" />
      <Heart className="h-3.5 w-3.5 fill-[#b8860b]/30" />
      <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#b8860b]/60 sm:w-16" />
    </div>
  );
}

/** A numbered, card-like group so the form reads as short, clear steps. */
function Step({
  number,
  id,
  title,
  hint,
  children,
}: {
  number: number;
  id: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="group"
      aria-labelledby={id}
      className="rounded-2xl border border-[#b8860b]/20 bg-[#fffaf0]/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_14px_-12px_rgba(74,47,12,0.5)] sm:p-5"
    >
      <div className="mb-4 flex items-start gap-3">
        <span
          aria-hidden
          className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#8b3a4a] font-cinzel text-[13px] font-bold text-[#fff4d2] shadow-[0_3px_8px_-4px_rgba(139,58,74,0.8)]"
        >
          {number}
        </span>
        <div className="min-w-0">
          <h3
            id={id}
            className="font-display text-[1.4rem] font-medium leading-tight text-[#2a1540] sm:text-[1.55rem]"
          >
            {title}
          </h3>
          {hint ? <p className={cn("mt-1", mutedCls)}>{hint}</p> : null}
        </div>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  optional,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="flex items-baseline justify-between gap-3">
        <span className={fieldLabelCls}>{label}</span>
        {optional ? (
          <span className="shrink-0 font-serif text-[0.92rem] italic text-[#5c3a12]/80">
            Optional
          </span>
        ) : null}
      </label>
      {hint ? <p className="mt-0.5 font-serif text-[0.95rem] text-[#5c3a12]">{hint}</p> : null}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-3">
      <dt className="shrink-0 font-serif text-[0.98rem] text-[#5c3a12]">{label}</dt>
      <dd className="text-right font-serif text-[1.05rem] font-semibold text-[#2a1540]">{value}</dd>
    </div>
  );
}

function mealIcon(label: string): LucideIcon {
  const l = label.toLowerCase();
  if (/beef|steak|pork|lamb|meat/.test(l)) return Beef;
  if (/chicken|poultry|turkey|duck/.test(l)) return Drumstick;
  if (/fish|seafood|salmon|prawn|shrimp/.test(l)) return Fish;
  if (/vegan/.test(l)) return Leaf;
  if (/veg|salad|plant/.test(l)) return Salad;
  return UtensilsCrossed;
}

const NO_PREFERENCE = "No preference";

/** "Beef, Chicken" → ["Beef", "Chicken"], keeping only options on the card. */
function parseMeals(value: string | null | undefined, choices: readonly string[]): string[] {
  if (!value) return [];
  const picked = value
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return choices.filter((c) => picked.includes(c.toLowerCase()));
}

function MealOption({
  label,
  selected,
  wide,
  onSelect,
}: {
  label: string;
  selected: boolean;
  wide?: boolean;
  onSelect: () => void;
}) {
  const Icon = mealIcon(label);
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "group relative flex min-h-[3.75rem] items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8860b]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6ead0] active:scale-[0.98] sm:px-4",
        wide && "col-span-2 justify-center",
        selected
          ? "border-[#b8860b] bg-gradient-to-br from-[#fff4d2] via-[#f6e0a4] to-[#e9c46a] shadow-[0_8px_20px_-10px_rgba(139,90,11,0.55),inset_0_1px_0_rgba(255,255,255,0.7)]"
          : "border-[#b8860b]/30 bg-[#fffaf0]/90 shadow-[0_2px_6px_-4px_rgba(74,47,12,0.25)] hover:-translate-y-0.5 hover:border-[#b8860b]/60 hover:shadow-[0_8px_18px_-12px_rgba(139,90,11,0.5)]",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors duration-300",
          selected
            ? "border-[#8b5a0b]/30 bg-[#8b3a4a] text-[#fff4d2]"
            : "border-[#b8860b]/30 bg-[#f6ead0] text-[#8b5a0b] group-hover:bg-[#f0dcae]",
        )}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </span>
      <span
        className={cn(
          "font-serif text-[1.02rem] leading-tight text-[#2a1540] sm:text-[1.08rem]",
          selected && "font-semibold",
        )}
      >
        {label}
      </span>
      <span
        aria-hidden
        className={cn(
          "absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-[#8b3a4a] text-white shadow-md ring-2 ring-[#fffaf0] transition-all duration-300",
          selected ? "scale-100 opacity-100" : "scale-50 opacity-0",
        )}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    </button>
  );
}

function RadioCard({
  icon: Icon,
  label,
  description,
  checked,
  onSelect,
}: {
  icon: LucideIcon;
  label: string;
  description?: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={cn(
        "group relative flex min-h-[4.25rem] items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8860b]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6ead0] active:scale-[0.98] sm:px-4",
        checked
          ? "border-[#b8860b] bg-gradient-to-br from-[#fff4d2] via-[#f6e0a4] to-[#e9c46a] shadow-[0_8px_20px_-10px_rgba(139,90,11,0.55),inset_0_1px_0_rgba(255,255,255,0.7)]"
          : "border-[#b8860b]/30 bg-[#fffaf0]/90 shadow-[0_2px_6px_-4px_rgba(74,47,12,0.25)] hover:-translate-y-0.5 hover:border-[#b8860b]/60 hover:shadow-[0_8px_18px_-12px_rgba(139,90,11,0.5)]",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors duration-300",
          checked
            ? "border-[#8b5a0b]/30 bg-[#8b3a4a] text-[#fff4d2]"
            : "border-[#b8860b]/30 bg-[#f6ead0] text-[#8b5a0b] group-hover:bg-[#f0dcae]",
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span
          className={cn(
            "font-serif text-[1.1rem] leading-tight text-[#2a1540]",
            checked ? "font-bold" : "font-semibold",
          )}
        >
          {label}
        </span>
        {description ? (
          <span className="mt-0.5 font-serif text-[0.95rem] leading-snug text-[#5c3a12]">
            {description}
          </span>
        ) : null}
      </span>
      <span
        aria-hidden
        className={cn(
          "absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-[#8b3a4a] text-white shadow-md ring-2 ring-[#fffaf0] transition-all duration-300",
          checked ? "scale-100 opacity-100" : "scale-50 opacity-0",
        )}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    </button>
  );
}
