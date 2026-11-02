"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useLanternContent } from "../content-context";
import { useExperience } from "../experience/experience-provider";
import { MagicDust } from "../effects/magic-dust";
import { SparkleBurst } from "../effects/sparkle-burst";
import { FloatingLanterns } from "../effects/floating-lanterns";
import { SectionHeading } from "../ui/section-heading";
import { LuxuryCard } from "../ui/luxury-card";
import { GoldButton } from "../ui/gold-button";
import type { InvitationGuest, InvitationResponse, RsvpStatusValue } from "../types";

const LUXURY = [0.16, 1, 0.3, 1] as const;

const labelCls =
  "font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-ink/70";
const inputCls =
  "w-full rounded-xl border px-4 py-3 font-serif text-[1.05rem] text-ink outline-none transition focus:ring-2 placeholder:text-ink/35";
const errCls = "mt-1 font-sans text-xs text-lantern-rose";

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
  const { invitationToken } = useExperience();
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
  const [message, setMessage] = React.useState(response?.message ?? "");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function loadResponse(next: InvitationResponse | null) {
    setAttending(next?.attending ?? null);
    setMealPreference(next?.mealPreference ?? "");
    setDietaryRestrictions(next?.dietaryRestrictions ?? "");
    setPlusOneName(next?.plusOneName ?? "");
    setMessage(next?.message ?? "");
  }

  function startChange() {
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
      message: message.trim() || null,
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
        | { success?: boolean; message?: string; error?: string }
        | null;

      if (!res.ok || !payload?.success) {
        const failure =
          payload?.error ||
          (res.status === 404
            ? "This invitation link is invalid or has expired."
            : "We couldn't send your reply. Please try again.");
        setError(failure);
        toast.error(failure);
        return;
      }

      setStatus(reply.attending ? "ACCEPTED" : "DECLINED");
      setSavedResponse(reply);
      setJustSubmitted(true);
      setEditing(false);
    } catch {
      const failure = "We couldn't send your reply. Please check your connection and try again.";
      setError(failure);
      toast.error(failure);
    } finally {
      setPending(false);
    }
  }

  const showSuccess = !editing && status !== "PENDING";

  return (
    <section
      id="rsvp"
      className="relative overflow-hidden lantern-section"
      style={{ backgroundColor: "var(--color-petal)" }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(232,130,154,0.5) 50%, transparent)",
        }}
      />
      <MagicDust count={20} intensity="soft" className="opacity-45" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-10 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-lantern/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={wedding.rsvp.eyebrow}
          title={wedding.rsvp.title}
          intro={wedding.rsvp.intro}
          theme="light"
        />
        <p className="mt-4 text-center font-sans text-[11px] uppercase tracking-[0.3em] text-lantern-rose/80">
          Kindly respond by {wedding.rsvp.deadline}
        </p>

        <div className="relative mt-12">
          <LuxuryCard variant="light" className="storybook-panel">
            <AnimatePresence mode="wait">
              {showSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: LUXURY }}
                  className="relative flex flex-col items-center py-10 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <SparkleBurst />
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 14 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full text-night"
                    style={{
                      background: "linear-gradient(135deg, #f4c444, #e8829a)",
                      boxShadow: "0 0 40px rgba(244,196,68,0.5)",
                    }}
                  >
                    <Check className="h-9 w-9" />
                  </motion.span>
                  <h3 className="mt-6 font-display text-3xl font-semibold text-ink">
                    {justSubmitted ? "Thank You!" : statusHeadline[status]}
                  </h3>
                  <p className="mt-3 max-w-md font-serif text-[1.05rem] leading-[1.85] text-ink/80">
                    {status === "DECLINED"
                      ? "We'll miss you dearly, but we're so grateful you let us know. Sending love your way."
                      : "Your response has been received. We can't wait to celebrate our happily ever after with you!"}
                  </p>
                  {status === "ACCEPTED" && savedResponse && (
                    <p className="mt-3 font-sans text-sm text-ink/65">
                      {savedResponse.mealPreference
                        ? `Meal: ${savedResponse.mealPreference}`
                        : "Meal to be confirmed"}
                      {savedResponse.plusOneName ? `, with ${savedResponse.plusOneName}` : ""}
                    </p>
                  )}
                  <div className="mt-6 flex items-center gap-2 font-serif italic text-lantern-rose">
                    <Heart className="h-4 w-4" />
                    {wedding.meta.hashtag}
                  </div>
                  <button
                    type="button"
                    onClick={startChange}
                    className="mt-8 font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-lantern-rose underline decoration-lantern-rose/40 underline-offset-8 transition hover:text-ink"
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
                  className="flex flex-col gap-5"
                  noValidate
                >
                  {status !== "PENDING" && (
                    <p className="text-center font-serif text-sm leading-relaxed text-ink/70">
                      Your current reply is{" "}
                      <span className="italic">{statusHeadline[status].toLowerCase()}</span>. Sending
                      this form will replace it.
                    </p>
                  )}

                  <div>
                    <label htmlFor="guest-name" className={labelCls}>
                      Full Name
                    </label>
                    <input
                      id="guest-name"
                      type="text"
                      value={guestName}
                      disabled
                      className={cn(
                        inputCls,
                        "mt-2 border-lantern-rose/25 bg-cream/80 shadow-inner opacity-80",
                      )}
                    />
                  </div>

                  <div>
                    <span className={labelCls}>Will you attend?</span>
                    <div className="mt-2 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
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
                        <div className="flex flex-col gap-5 pt-1">
                          <div>
                            <label htmlFor="meal" className={labelCls}>
                              Meal Preference
                            </label>
                            <select
                              id="meal"
                              value={mealPreference}
                              onChange={(e) => {
                                setMealPreference(e.target.value);
                                setError(null);
                              }}
                              className={cn(
                                inputCls,
                                "mt-2 border-lantern-rose/25 bg-cream/80 focus:border-lantern-rose/60 focus:ring-lantern-rose/20",
                              )}
                            >
                              <option value="">Select an option</option>
                              {mealChoices.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label htmlFor="dietary" className={labelCls}>
                              Allergies / Dietary Needs
                            </label>
                            <input
                              id="dietary"
                              type="text"
                              value={dietaryRestrictions}
                              onChange={(e) => setDietaryRestrictions(e.target.value)}
                              className={cn(
                                inputCls,
                                "mt-2 border-lantern-rose/25 bg-cream/80 shadow-inner focus:border-lantern-rose/60 focus:ring-lantern-rose/20",
                              )}
                            />
                          </div>

                          {plusOneAllowed && (
                            <div>
                              <label htmlFor="plusOneName" className={labelCls}>
                                Plus One Name
                              </label>
                              <input
                                id="plusOneName"
                                type="text"
                                value={plusOneName}
                                onChange={(e) => setPlusOneName(e.target.value)}
                                className={cn(
                                  inputCls,
                                  "mt-2 border-lantern-rose/25 bg-cream/80 shadow-inner focus:border-lantern-rose/60 focus:ring-lantern-rose/20",
                                )}
                              />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {attending !== null && (
                    <div>
                      <label htmlFor="message" className={labelCls}>
                        Special Requests / Message
                      </label>
                      <textarea
                        id="message"
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Dietary needs, a note for the couple, a song request..."
                        className={cn(
                          inputCls,
                          "mt-2 resize-none border-lantern-rose/25 bg-cream/80 shadow-inner focus:border-lantern-rose/60 focus:ring-lantern-rose/20",
                        )}
                      />
                    </div>
                  )}

                  {error && <p className={cn(errCls, "text-center")}>{error}</p>}
                  {!effectiveToken && (
                    <p className="text-center font-sans text-sm text-ink/60">
                      Preview mode: open a personalized invitation link to submit RSVP.
                    </p>
                  )}

                  <GoldButton
                    type="submit"
                    size="lg"
                    disabled={pending || attending === null || !effectiveToken}
                    className="mt-2 w-full"
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
                      className="font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-ink/55 transition hover:text-ink"
                    >
                      Keep my current reply
                    </button>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </LuxuryCard>

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
        </div>
      </div>
    </section>
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
        "flex min-h-12 cursor-pointer items-center justify-center rounded-xl border px-4 py-3.5 text-center font-serif text-[0.95rem] transition-all duration-300 sm:text-[1rem]",
        checked
          ? "border-lantern-rose/60 bg-lantern-rose/10 text-ink shadow-[0_0_0_3px_rgba(232,130,154,0.15)]"
          : "border-lantern-rose/20 bg-cream/60 text-ink/70 hover:border-lantern-rose/40",
      )}
    >
      {label}
    </button>
  );
}
