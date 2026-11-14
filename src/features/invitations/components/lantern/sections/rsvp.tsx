"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Heart, Loader2, Sparkles } from "lucide-react";
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
import type { InvitationCheckIn, InvitationGuest, InvitationResponse, RsvpStatusValue } from "../types";
import { GuestCheckInQrCard } from "@/features/check-in/components/guest-check-in-qr-card";
import {
  joinRsvpMessage,
  splitRsvpMessage,
} from "@/features/invitations/rsvp-message";

const LUXURY = [0.16, 1, 0.3, 1] as const;

const labelCls =
  "font-cinzel text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8a5a1e]";
const inputCls =
  "w-full rounded-xl border border-[#b8860b]/30 bg-[#fffaf0]/80 px-4 py-3.5 font-serif text-[1.05rem] leading-relaxed text-[#3a2410] outline-none transition placeholder:text-[#3a2410]/40 focus:border-[#b8860b]/60 focus:ring-2 focus:ring-[#b8860b]/20";
const errCls = "mt-1 text-center font-sans text-sm text-[#9b1c1c]";

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
  const [mealPreference, setMealPreference] = React.useState(response?.mealPreference ?? "");
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
    setMealPreference(next?.mealPreference ?? "");
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
    if (attending && !mealChoices.includes(mealPreference)) {
      setError("Please choose a meal preference.");
      return;
    }

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

      <div className="relative z-10 mx-auto max-w-2xl px-3 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.95, ease: LUXURY }}
          className="relative"
        >
          <OrnateScroll>
            <header className="mb-7 flex flex-col items-center text-center sm:mb-8">
              <p className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.42em] text-[#8a5a1e]">
                {wedding.rsvp.eyebrow}
              </p>
              <h2 className="mt-3 font-display text-[2rem] font-light leading-[1.08] tracking-[-0.02em] text-[#3a2410] min-[380px]:text-[2.35rem] sm:text-5xl">
                {wedding.rsvp.title}
              </h2>
              <p className="mt-3 max-w-md font-serif text-[0.98rem] italic leading-relaxed text-[#4a3218]/85 sm:text-lg">
                {wedding.rsvp.intro}
              </p>
              <p className="mt-4 font-cinzel text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8a5a1e]/85">
                Kindly respond by {wedding.rsvp.deadline}
              </p>
            </header>

            <AnimatePresence mode="wait">
              {showSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: LUXURY }}
                  className="relative flex flex-col items-center py-4 text-center sm:py-6"
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
                    <Check className="h-8 w-8 sm:h-9 sm:w-9" />
                  </motion.span>
                  <h3 className="mt-5 font-display text-3xl font-light text-[#3a2410] sm:text-4xl">
                    {justSubmitted ? "Thank You!" : statusHeadline[status]}
                  </h3>
                  <p className="mt-3 max-w-md font-serif text-[1.05rem] leading-[1.85] text-[#4a3218]/85">
                    {status === "DECLINED"
                      ? "We'll miss you dearly, but we're so grateful you let us know. Sending love your way."
                      : "Your response has been received. We can't wait to celebrate our happily ever after with you!"}
                  </p>
                  {status === "ACCEPTED" && savedResponse && (
                    <p className="mt-3 font-sans text-sm text-[#4a3218]/65">
                      {savedResponse.mealPreference
                        ? `Meal: ${savedResponse.mealPreference}`
                        : "Meal to be confirmed"}
                      {savedResponse.plusOneName ? `, with ${savedResponse.plusOneName}` : ""}
                    </p>
                  )}
                  {status === "ACCEPTED" && checkIn ? (
                    <GuestCheckInQrCard
                      qrDataUrl={checkIn.qrDataUrl}
                      fullName={checkIn.fullName}
                      variant="invite"
                    />
                  ) : null}
                  <div className="mt-6 flex items-center gap-2 font-serif italic text-[#8a5a1e]">
                    <Heart className="h-4 w-4" />
                    {wedding.meta.hashtag}
                  </div>
                  <button
                    type="button"
                    onClick={startChange}
                    className="mt-8 font-cinzel text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a5a1e] underline decoration-[#8a5a1e]/40 underline-offset-8 transition hover:text-[#3a2410]"
                  >
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
                  className="flex flex-col gap-6"
                  noValidate
                >
                  <div className="flex items-center justify-center gap-2 text-[#8a5a1e]/75">
                    <Sparkles className="h-3.5 w-3.5" />
                    <p className="font-serif text-sm italic text-[#4a3218]/75">
                      {status !== "PENDING" ? (
                        <>
                          Your current reply is{" "}
                          <span className="text-[#3a2410]">
                            {statusHeadline[status].toLowerCase()}
                          </span>
                          . Sending this form will replace it.
                        </>
                      ) : (
                        <>Dear {guestName}, we&apos;d be honored by your reply.</>
                      )}
                    </p>
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>

                  <Field label="Full Name" htmlFor="guest-name">
                    <input
                      id="guest-name"
                      type="text"
                      value={guestName}
                      disabled
                      className={cn(inputCls, "cursor-not-allowed bg-[#f3e2c0]/70 text-[#3a2410]/75")}
                    />
                  </Field>

                  <div>
                    <span className={labelCls}>Will you attend?</span>
                    <div className="mt-3 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
                      <RadioCard
                        label="Joyfully Accept"
                        checked={attending === true}
                        onSelect={() => {
                          setAttending(true);
                          setError(null);
                        }}
                      />
                      <RadioCard
                        label="Regretfully Decline"
                        checked={attending === false}
                        onSelect={() => {
                          setAttending(false);
                          setError(null);
                        }}
                      />
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {attending === true && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: LUXURY }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-6 border-t border-[#b8860b]/25 pt-6">
                          <div>
                            <span className={labelCls}>Meal Preference</span>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {mealChoices.map((meal) => {
                                const selected = mealPreference === meal;
                                return (
                                  <button
                                    key={meal}
                                    type="button"
                                    onClick={() => {
                                      setMealPreference(meal);
                                      setError(null);
                                    }}
                                    className={cn(
                                      "rounded-full border px-4 py-2 font-serif text-sm transition",
                                      selected
                                        ? "border-[#b8860b]/70 bg-[#d4a840]/20 text-[#3a2410] shadow-[0_0_0_3px_rgba(184,134,11,0.12)]"
                                        : "border-[#b8860b]/25 bg-[#fffaf0]/75 text-[#3a2410]/75 hover:border-[#b8860b]/45",
                                    )}
                                  >
                                    {meal}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <Field label="Allergies / Dietary Needs" htmlFor="dietary">
                            <input
                              id="dietary"
                              type="text"
                              value={dietaryRestrictions}
                              onChange={(e) => setDietaryRestrictions(e.target.value)}
                              placeholder="Optional"
                              className={inputCls}
                            />
                          </Field>

                          {plusOneAllowed && (
                            <Field label="Plus One Name" htmlFor="plusOneName">
                              <input
                                id="plusOneName"
                                type="text"
                                value={plusOneName}
                                onChange={(e) => setPlusOneName(e.target.value)}
                                className={inputCls}
                              />
                            </Field>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {attending !== null && (
                    <div className="flex flex-col gap-6 border-t border-[#b8860b]/25 pt-2">
                      <Field label="Special Requests / Message" htmlFor="message">
                        <textarea
                          id="message"
                          rows={3}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="A note for the couple, a song request..."
                          className={cn(inputCls, "resize-none")}
                        />
                      </Field>

                      <Field label="Suggest Wedding Hashtags" htmlFor="suggestedHashtags">
                        <input
                          id="suggestedHashtags"
                          type="text"
                          value={suggestedHashtags}
                          onChange={(e) => setSuggestedHashtags(e.target.value)}
                          placeholder="#LemuelAndGrazielle #OurHappilyEverAfter"
                          className={inputCls}
                        />
                      </Field>
                    </div>
                  )}

                  {error && <p className={errCls}>{error}</p>}
                  {!effectiveToken && (
                    <p className="text-center font-serif text-sm italic text-[#4a3218]/65">
                      Preview mode: open a personalized invitation link to submit RSVP.
                    </p>
                  )}

                  <GoldButton
                    type="submit"
                    size="lg"
                    disabled={pending || attending === null || !effectiveToken}
                    className="mt-1 w-full"
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

                  {status !== "PENDING" && (
                    <button
                      type="button"
                      onClick={keepCurrentReply}
                      disabled={pending}
                      className="font-cinzel text-[11px] font-semibold uppercase tracking-[0.28em] text-[#4a3218]/55 transition hover:text-[#3a2410]"
                    >
                      Keep my current reply
                    </button>
                  )}
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

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelCls}>
        {label}
      </label>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

function RadioCard({
  label,
  checked,
  onSelect,
}: {
  label: string;
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
        "flex min-h-12 cursor-pointer items-center justify-center rounded-xl border px-4 py-3.5 text-center font-serif text-[0.98rem] transition-all duration-300 sm:text-[1.05rem]",
        checked
          ? "border-[#b8860b]/70 bg-[#d4a840]/20 text-[#3a2410] shadow-[0_0_0_3px_rgba(184,134,11,0.14)]"
          : "border-[#b8860b]/25 bg-[#fffaf0]/75 text-[#3a2410]/75 hover:border-[#b8860b]/45",
      )}
    >
      {label}
    </button>
  );
}
