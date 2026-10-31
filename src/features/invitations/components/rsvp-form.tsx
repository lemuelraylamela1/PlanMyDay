"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { submitInvitationRsvpAction } from "@/features/invitations/actions";
import { RsvpCelebration } from "@/features/invitations/components/fairytale/rsvp-celebration";
import {
  fairytaleMotion,
  fairytaleTransition,
} from "@/features/invitations/components/fairytale/use-reveal";
import { displayFont, scriptFont, smallCaps } from "@/features/invitations/components/fairytale/ornaments";
import type {
  InvitationResponse,
  RsvpStatusValue,
} from "@/features/invitations/components/fairytale/types";

interface Props {
  token: string;
  guestName: string;
  monogram: string;
  plusOneAllowed: boolean;
  initialStatus: RsvpStatusValue;
  initialResponse: InvitationResponse | null;
}

const choices = [
  { value: true, title: "Joyfully accept", note: "With pleasure" },
  { value: false, title: "Regretfully decline", note: "With regret" },
] as const;

const mealChoices = ["Beef", "Pork", "Fish", "All of the above"] as const;

const statusHeadline: Record<Exclude<RsvpStatusValue, "PENDING">, string> = {
  ACCEPTED: "Joyfully accepted",
  DECLINED: "Regretfully declined",
  TENTATIVE: "Noted as tentative",
};

const inputClass = cn(
  displayFont,
  "w-full rounded-none border-0 border-b border-[#DDBF8D]/80 bg-transparent px-0 py-2.5 text-xl text-[#4a3236] placeholder:text-[#b9a294]/70 transition-[border-color,box-shadow,color] duration-500 focus:border-[#B76E79] focus:outline-none focus:ring-0 focus:shadow-[0_1px_0_0_rgba(183,110,121,0.55)]",
);

export function RsvpForm({
  token,
  guestName,
  monogram,
  plusOneAllowed,
  initialStatus,
  initialResponse,
}: Props) {
  const reduceMotion = useReducedMotion();
  const fade = reduceMotion
    ? {
        initial: false as const,
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.01 },
      }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6 },
        transition: fairytaleTransition(fairytaleMotion.panel),
      };
  const [status, setStatus] = React.useState<RsvpStatusValue>(initialStatus);
  const [savedResponse, setSavedResponse] = React.useState<InvitationResponse | null>(initialResponse);
  const [editing, setEditing] = React.useState(initialStatus === "PENDING");
  const [justSubmitted, setJustSubmitted] = React.useState(false);
  /** Celebration overlay only after the server confirms the RSVP. */
  const [celebration, setCelebration] = React.useState<"accept" | "decline" | null>(null);

  const [attending, setAttending] = React.useState<boolean | null>(initialResponse?.attending ?? null);
  const [mealPreference, setMealPreference] = React.useState(initialResponse?.mealPreference ?? "");
  const [dietaryRestrictions, setDietaryRestrictions] = React.useState(initialResponse?.dietaryRestrictions ?? "");
  const [plusOneName, setPlusOneName] = React.useState(initialResponse?.plusOneName ?? "");
  const [message, setMessage] = React.useState(initialResponse?.message ?? "");

  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function loadResponse(response: InvitationResponse | null) {
    setAttending(response?.attending ?? null);
    setMealPreference(response?.mealPreference ?? "");
    setDietaryRestrictions(response?.dietaryRestrictions ?? "");
    setPlusOneName(response?.plusOneName ?? "");
    setMessage(response?.message ?? "");
  }

  function startChange() {
    loadResponse(savedResponse);
    setError(null);
    setJustSubmitted(false);
    setCelebration(null);
    setEditing(true);
  }

  function keepCurrentReply() {
    loadResponse(savedResponse);
    setError(null);
    setEditing(false);
  }

  const [portalReady, setPortalReady] = React.useState(false);
  React.useEffect(() => setPortalReady(true), []);

  React.useEffect(() => {
    if (!celebration) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => setCelebration(null), reduceMotion ? 1200 : 9000);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(timer);
    };
  }, [celebration, reduceMotion]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (attending === null) {
      setError("Please let us know if you can make it.");
      return;
    }
    if (attending && !mealChoices.includes(mealPreference as (typeof mealChoices)[number])) {
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
      const result = await submitInvitationRsvpAction(token, {
        attending: reply.attending,
        partySize: reply.partySize,
        mealPreference: reply.mealPreference ?? "",
        dietaryRestrictions: reply.dietaryRestrictions ?? "",
        plusOneName: reply.plusOneName ?? "",
        message: reply.message ?? "",
      });
      if (!result.success) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      // Success UI only after the server confirms the RSVP.
      setStatus(reply.attending ? "ACCEPTED" : "DECLINED");
      setSavedResponse(reply);
      setJustSubmitted(true);
      setEditing(false);
      setCelebration(reply.attending ? "accept" : "decline");
    } catch {
      const failure = "We couldn't send your reply. Please check your connection and try again.";
      setError(failure);
      toast.error(failure);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        {!editing && status !== "PENDING" ? (
          <motion.div key="confirmed" {...fade} role="status" aria-live="polite" className="text-center">
            <p className={cn(smallCaps, "text-[#9b7b62]")}>
              {justSubmitted ? "Your reply has been received" : "Your reply is on record"}
            </p>
            <p className={cn(displayFont, "mt-5 text-4xl font-light text-[#4a3236]")}>{statusHeadline[status]}</p>
            {status === "ACCEPTED" && savedResponse && (
              <p className="mt-3 text-sm text-[#7a5d62]">
                {savedResponse.mealPreference ? `Meal: ${savedResponse.mealPreference}` : "Meal to be confirmed"}
                {savedResponse.plusOneName ? `, with ${savedResponse.plusOneName}` : ""}
              </p>
            )}
            {justSubmitted && !celebration && (
              <p className={cn(scriptFont, "mt-6 text-3xl text-[#B76E79]")}>
                {status === "ACCEPTED" ? `Thank you, ${guestName}` : `Thank you for letting us know, ${guestName}`}
              </p>
            )}
            <button
              type="button"
              onClick={startChange}
              disabled={Boolean(celebration)}
              className={cn(
                smallCaps,
                "mt-10 text-[#B76E79] underline decoration-[#DDBF8D] underline-offset-8 transition-colors hover:text-[#4a3236] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DDBF8D] focus-visible:ring-offset-4 focus-visible:ring-offset-[#FFFDF8] disabled:opacity-40",
              )}
            >
              Change my response
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" {...fade} onSubmit={submit} noValidate className="space-y-10">
            {status !== "PENDING" && (
              <p className="text-center text-sm leading-relaxed text-[#7a5d62]">
                Your current reply is <span className="italic">{statusHeadline[status].toLowerCase()}</span>. Sending
                this form will replace it.
              </p>
            )}

            <div>
              <p className={cn(smallCaps, "mb-5 text-center text-[#9b7b62]")}>Will you be attending?</p>
              <div role="radiogroup" aria-label="Will you be attending?" className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                {choices.map((choice) => {
                  const selected = attending === choice.value;
                  return (
                    <motion.button
                      key={choice.title}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => {
                        setAttending(choice.value);
                        setError(null);
                      }}
                      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                      className={cn(
                        "relative overflow-hidden px-3 py-5 text-center transition-colors duration-500 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DDBF8D] focus-visible:ring-offset-4 focus-visible:ring-offset-[#FFFDF8]",
                        selected ? "text-[#4a3236]" : "text-[#6d4a50] hover:text-[#4a3236]",
                      )}
                    >
                      <motion.span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,212,168,0.28),transparent_70%)]"
                        initial={false}
                        animate={{ opacity: selected ? 1 : 0 }}
                        transition={fairytaleTransition(fairytaleMotion.ui)}
                      />
                      <span className={cn(displayFont, "relative block text-2xl")}>{choice.title}</span>
                      <span className={cn(smallCaps, "relative mt-2 block text-[#9b7b62]")}>{choice.note}</span>
                      <motion.span
                        aria-hidden
                        className="relative mx-auto mt-4 block h-px w-16 origin-center bg-gradient-to-r from-transparent via-[#B76E79] to-transparent"
                        initial={false}
                        animate={{ opacity: selected ? 1 : 0, scaleX: selected ? 1 : 0.4 }}
                        transition={fairytaleTransition(fairytaleMotion.ui)}
                      />
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence initial={false} mode="wait">
              {attending && (
                <motion.div
                  key="attending-details"
                  initial={reduceMotion ? false : { opacity: 0, y: 16, height: "auto" }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                  transition={fairytaleTransition(fairytaleMotion.panel)}
                  className="space-y-8"
                >
                  <div>
                    <p className={cn(smallCaps, "text-[#9b7b62]")}>Meal preference</p>
                    <div
                      role="radiogroup"
                      aria-label="Meal preference"
                      className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-3 sm:justify-start"
                    >
                      {mealChoices.map((choice) => {
                        const selected = mealPreference === choice;
                        return (
                          <motion.button
                            key={choice}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => {
                              setMealPreference(choice);
                              setError(null);
                            }}
                            whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                            className={cn(
                              displayFont,
                              "border-b pb-1 text-lg transition-colors duration-500 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DDBF8D] focus-visible:ring-offset-4 focus-visible:ring-offset-[#FFFDF8]",
                              selected
                                ? "border-[#B76E79] text-[#4a3236]"
                                : "border-transparent text-[#6d4a50] hover:border-[#DDBF8D]/70 hover:text-[#4a3236]",
                            )}
                          >
                            {choice}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                  <Field id="dietary" label="Allergies">
                    <input
                      id="dietary"
                      value={dietaryRestrictions}
                      onChange={(event) => setDietaryRestrictions(event.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  {plusOneAllowed && (
                    <Field id="plusOneName" label="Plus one name">
                      <input
                        id="plusOneName"
                        value={plusOneName}
                        onChange={(event) => setPlusOneName(event.target.value)}
                        className={inputClass}
                      />
                    </Field>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {attending !== null && (
                <motion.div key="message" {...fade}>
                  <Field id="message" label="A note for the couple (optional)">
                    <textarea
                      id="message"
                      rows={3}
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      className={cn(inputClass, "resize-none text-lg")}
                    />
                  </Field>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.p
                  key={error}
                  role="alert"
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={fairytaleTransition(fairytaleMotion.ui)}
                  className="border-y border-[#E8B8C7]/55 bg-[#FFF8F6]/80 px-4 py-3 text-center text-sm leading-relaxed text-[#a2475a]"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={pending || attending === null}
                className={cn(
                  smallCaps,
                  "relative inline-flex w-full items-center justify-center gap-3 overflow-hidden bg-[#4a3236] px-8 py-4 text-[11px] text-[#FFFDF8] transition-[background-color,transform,opacity] duration-500 ease-out motion-safe:hover:-translate-y-px hover:bg-[#B76E79] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DDBF8D] focus-visible:ring-offset-4 focus-visible:ring-offset-[#FFFDF8] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-[#4a3236]",
                )}
              >
                {pending && !reduceMotion && (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(232,212,168,0.18)_50%,transparent_80%)]"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                {pending && <Loader2 className="relative h-4 w-4 animate-spin" />}
                <span className="relative">
                  {pending ? "Sending your reply" : status === "PENDING" ? "Send my reply" : "Update my reply"}
                </span>
              </button>
              {status !== "PENDING" && (
                <button
                  type="button"
                  onClick={keepCurrentReply}
                  disabled={pending}
                  className={cn(
                    smallCaps,
                    "block w-full py-2 text-center text-[#9b7b62] transition-colors hover:text-[#4a3236] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DDBF8D]",
                  )}
                >
                  Keep my current reply
                </button>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {portalReady &&
        createPortal(
          <AnimatePresence>
            {celebration && (
              <RsvpCelebration
                key={`${celebration}-celebration`}
                variant={celebration}
                guestName={guestName}
                monogram={monogram}
                reduceMotion={Boolean(reduceMotion)}
              />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="group/field space-y-2">
      <label
        htmlFor={id}
        className={cn(
          smallCaps,
          "block text-[#9b7b62] transition-colors duration-500 group-focus-within/field:text-[#B76E79]",
        )}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
