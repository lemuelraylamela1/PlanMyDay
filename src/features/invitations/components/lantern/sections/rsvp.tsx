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
import type { InvitationCheckIn, InvitationGuest, InvitationResponse, RsvpStatusValue } from "../types";
import { GuestCheckInQrCard } from "@/features/check-in/components/guest-check-in-qr-card";

const LUXURY = [0.16, 1, 0.3, 1] as const;

const labelCls =
  "font-cinzel text-[10px] font-semibold uppercase tracking-[0.28em] text-lantern-rose";
const inputCls =
  "w-full rounded-2xl border border-lantern-rose/25 bg-[#fffaf6] px-4 py-3.5 font-serif text-[1.05rem] leading-relaxed text-[#2a1a14] outline-none transition placeholder:text-[#2a1a14]/40 focus:border-lantern/55 focus:ring-2 focus:ring-lantern/20";
const errCls = "mt-1 text-center font-sans text-sm text-[#b42318]";

const statusHeadline: Record<Exclude<RsvpStatusValue, "PENDING">, string> = {
  ACCEPTED: "Joyfully accepted",
  DECLINED: "Regretfully declined",
  TENTATIVE: "Noted as tentative",
};

const HASHTAG_MARKER = "Suggested hashtags:";

function splitMessage(raw: string | null | undefined) {
  if (!raw) return { note: "", hashtags: "" };
  const idx = raw.lastIndexOf(HASHTAG_MARKER);
  if (idx === -1) return { note: raw, hashtags: "" };
  return {
    note: raw.slice(0, idx).trim(),
    hashtags: raw.slice(idx + HASHTAG_MARKER.length).trim(),
  };
}

function joinMessage(note: string, hashtags: string) {
  const cleanedNote = note.trim();
  const cleanedTags = hashtags.trim();
  if (!cleanedTags) return cleanedNote || null;
  if (!cleanedNote) return `${HASHTAG_MARKER} ${cleanedTags}`;
  return `${cleanedNote}\n\n${HASHTAG_MARKER} ${cleanedTags}`;
}

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
  const initialMessage = splitMessage(response?.message);
  const [message, setMessage] = React.useState(initialMessage.note);
  const [suggestedHashtags, setSuggestedHashtags] = React.useState(
    initialMessage.hashtags,
  );
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [checkIn, setCheckIn] = React.useState<InvitationCheckIn | null>(guest?.checkIn ?? null);

  function loadResponse(next: InvitationResponse | null) {
    const parts = splitMessage(next?.message);
    setAttending(next?.attending ?? null);
    setMealPreference(next?.mealPreference ?? "");
    setDietaryRestrictions(next?.dietaryRestrictions ?? "");
    setPlusOneName(next?.plusOneName ?? "");
    setMessage(parts.note);
    setSuggestedHashtags(parts.hashtags);
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
      message: joinMessage(message, suggestedHashtags),
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
            ? "This invitation link is invalid or has expired."
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
      style={{
        background:
          "linear-gradient(180deg, #1a0f2e 0%, #2a1545 42%, #3a1d52 100%)",
      }}
    >
      <MagicDust count={22} intensity="soft" className="opacity-55" />
      <FloatingLanterns count={8} intensity="ambient" className="opacity-45" />
      <SceneAtmosphere tone="night" className="opacity-50" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-16 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-lantern/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f8ece8]/20 to-transparent"
      />

      <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: LUXURY }}
          className="flex flex-col items-center text-center"
        >
          <p className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.42em] text-lantern-soft/90">
            {wedding.rsvp.eyebrow}
          </p>
          <div className="mt-4 flex items-center gap-4 sm:gap-5">
            <span aria-hidden className="h-px w-8 bg-gradient-to-r from-transparent to-lantern/70 sm:w-12" />
            <h2 className="font-display text-[2.15rem] font-light leading-[1.08] tracking-[-0.02em] text-cream min-[380px]:text-[2.5rem] sm:text-5xl">
              {wedding.rsvp.title}
            </h2>
            <span aria-hidden className="h-px w-8 bg-gradient-to-l from-transparent to-lantern/70 sm:w-12" />
          </div>
          <p className="mt-4 max-w-xl font-serif text-base italic leading-relaxed text-cream/80 sm:text-lg">
            {wedding.rsvp.intro}
          </p>
          <p className="mt-4 font-cinzel text-[10px] font-semibold uppercase tracking-[0.3em] text-lantern/85">
            Kindly respond by {wedding.rsvp.deadline}
          </p>
        </motion.header>

        <div className="relative mt-10 sm:mt-12">
          <div
            className="relative overflow-hidden rounded-[1.75rem] border border-lantern/30 p-6 shadow-[0_30px_80px_-40px_rgba(244,196,68,0.35)] sm:p-8"
            style={{
              background:
                "linear-gradient(165deg, rgba(255,250,246,0.97) 0%, rgba(255,244,236,0.96) 55%, rgba(252,236,230,0.97) 100%)",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-3 rounded-[1.35rem] border border-lantern-rose/20"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-lantern/20 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-lantern-rose/20 blur-3xl"
            />

            <div className="relative z-10">
              <AnimatePresence mode="wait">
                {showSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: LUXURY }}
                    className="relative flex flex-col items-center py-8 text-center sm:py-10"
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
                    <h3 className="mt-6 font-display text-3xl font-light text-[#2a1a14] sm:text-4xl">
                      {justSubmitted ? "Thank You!" : statusHeadline[status]}
                    </h3>
                    <p className="mt-3 max-w-md font-serif text-[1.05rem] leading-[1.85] text-[#2a1a14]/80">
                      {status === "DECLINED"
                        ? "We'll miss you dearly, but we're so grateful you let us know. Sending love your way."
                        : "Your response has been received. We can't wait to celebrate our happily ever after with you!"}
                    </p>
                    {status === "ACCEPTED" && savedResponse && (
                      <p className="mt-3 font-sans text-sm text-[#2a1a14]/65">
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
                    <div className="mt-6 flex items-center gap-2 font-serif italic text-lantern-rose">
                      <Heart className="h-4 w-4" />
                      {wedding.meta.hashtag}
                    </div>
                    <button
                      type="button"
                      onClick={startChange}
                      className="mt-8 font-cinzel text-[11px] font-semibold uppercase tracking-[0.28em] text-lantern-rose underline decoration-lantern-rose/40 underline-offset-8 transition hover:text-[#2a1a14]"
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
                    <div className="flex items-center justify-center gap-2 text-lantern-rose/80">
                      <Sparkles className="h-3.5 w-3.5" />
                      <p className="font-serif text-sm italic text-[#2a1a14]/70">
                        {status !== "PENDING" ? (
                          <>
                            Your current reply is{" "}
                            <span className="text-[#2a1a14]">
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
                        className={cn(inputCls, "cursor-not-allowed bg-[#fff3ea] text-[#2a1a14]/75")}
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
                          <div className="flex flex-col gap-6 border-t border-lantern-rose/15 pt-6">
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
                                          ? "border-lantern/60 bg-lantern/15 text-[#2a1a14] shadow-[0_0_0_3px_rgba(244,196,68,0.15)]"
                                          : "border-lantern-rose/25 bg-[#fffaf6] text-[#2a1a14]/75 hover:border-lantern-rose/45",
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
                      <div className="flex flex-col gap-6 border-t border-lantern-rose/15 pt-2">
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
                      <p className="text-center font-serif text-sm italic text-[#2a1a14]/65">
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
                        className="font-cinzel text-[11px] font-semibold uppercase tracking-[0.28em] text-[#2a1a14]/55 transition hover:text-[#2a1a14]"
                      >
                        Keep my current reply
                      </button>
                    )}
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

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
        "flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border px-4 py-3.5 text-center font-serif text-[0.98rem] transition-all duration-300 sm:text-[1.05rem]",
        checked
          ? "border-lantern/55 bg-lantern/15 text-[#2a1a14] shadow-[0_0_0_3px_rgba(244,196,68,0.18)]"
          : "border-lantern-rose/25 bg-[#fffaf6] text-[#2a1a14]/75 hover:border-lantern-rose/45",
      )}
    >
      {label}
    </button>
  );
}
