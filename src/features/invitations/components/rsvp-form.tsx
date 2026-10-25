"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { submitInvitationRsvpAction } from "@/features/invitations/actions";
import { fairytaleEase } from "@/features/invitations/components/fairytale/use-reveal";
import { displayFont, scriptFont, smallCaps } from "@/features/invitations/components/fairytale/ornaments";
import type {
  InvitationResponse,
  RsvpStatusValue,
} from "@/features/invitations/components/fairytale/types";

interface Props {
  token: string;
  guestName: string;
  plusOneAllowed: boolean;
  initialStatus: RsvpStatusValue;
  initialResponse: InvitationResponse | null;
}

const choices = [
  { value: true, title: "Joyfully accept", note: "With pleasure" },
  { value: false, title: "Regretfully decline", note: "With regret" },
] as const;

const statusHeadline: Record<Exclude<RsvpStatusValue, "PENDING">, string> = {
  ACCEPTED: "Joyfully accepted",
  DECLINED: "Regretfully declined",
  TENTATIVE: "Noted as tentative",
};

const inputClass = cn(
  displayFont,
  "w-full rounded-none border-0 border-b border-[#DDBF8D]/80 bg-transparent px-0 py-2 text-xl text-[#4a3236] placeholder:text-[#b9a294]/70 transition-colors focus:border-[#B76E79] focus:outline-none focus:ring-0",
);

const fade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.5, ease: fairytaleEase },
};

export function RsvpForm({ token, guestName, plusOneAllowed, initialStatus, initialResponse }: Props) {
  const [status, setStatus] = React.useState<RsvpStatusValue>(initialStatus);
  const [savedResponse, setSavedResponse] = React.useState<InvitationResponse | null>(initialResponse);
  const [editing, setEditing] = React.useState(initialStatus === "PENDING");
  const [justSubmitted, setJustSubmitted] = React.useState(false);

  const [attending, setAttending] = React.useState<boolean | null>(initialResponse?.attending ?? null);
  const [partySize, setPartySize] = React.useState(String(initialResponse?.partySize ?? 1));
  const [mealPreference, setMealPreference] = React.useState(initialResponse?.mealPreference ?? "");
  const [dietaryRestrictions, setDietaryRestrictions] = React.useState(initialResponse?.dietaryRestrictions ?? "");
  const [plusOneName, setPlusOneName] = React.useState(initialResponse?.plusOneName ?? "");
  const [message, setMessage] = React.useState(initialResponse?.message ?? "");

  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function loadResponse(response: InvitationResponse | null) {
    setAttending(response?.attending ?? null);
    setPartySize(String(response?.partySize ?? 1));
    setMealPreference(response?.mealPreference ?? "");
    setDietaryRestrictions(response?.dietaryRestrictions ?? "");
    setPlusOneName(response?.plusOneName ?? "");
    setMessage(response?.message ?? "");
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
    if (attending === null) {
      setError("Please let us know if you can make it.");
      return;
    }
    const size = Number(partySize);
    if (attending && (!Number.isInteger(size) || size < 1)) {
      setError("Please enter how many will be in your party.");
      return;
    }

    const reply: InvitationResponse = {
      attending,
      partySize: attending ? size : 1,
      mealPreference: attending ? mealPreference.trim() || null : null,
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
      setStatus(reply.attending ? "ACCEPTED" : "DECLINED");
      setSavedResponse(reply);
      setJustSubmitted(true);
      setEditing(false);
      toast.success(result.message ?? "Your RSVP has been recorded.");
    } catch {
      const failure = "We couldn't send your reply. Please check your connection and try again.";
      setError(failure);
      toast.error(failure);
    } finally {
      setPending(false);
    }
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!editing && status !== "PENDING" ? (
        <motion.div key="confirmed" {...fade} role="status" aria-live="polite" className="text-center">
          <p className={cn(smallCaps, "text-[#9b7b62]")}>
            {justSubmitted ? "Your reply has been received" : "Your reply is on record"}
          </p>
          <p className={cn(displayFont, "mt-5 text-4xl font-light text-[#4a3236]")}>{statusHeadline[status]}</p>
          {status === "ACCEPTED" && savedResponse && (
            <p className="mt-3 text-sm text-[#7a5d62]">
              {savedResponse.partySize === 1 ? "A party of one" : `A party of ${savedResponse.partySize}`}
              {savedResponse.plusOneName ? `, with ${savedResponse.plusOneName}` : ""}
            </p>
          )}
          {justSubmitted && (
            <p className={cn(scriptFont, "mt-6 text-3xl text-[#B76E79]")}>
              {status === "ACCEPTED" ? `Thank you, ${guestName}` : `Thank you for letting us know, ${guestName}`}
            </p>
          )}
          <button
            type="button"
            onClick={startChange}
            className={cn(
              smallCaps,
              "mt-10 text-[#B76E79] underline decoration-[#DDBF8D] underline-offset-8 transition-colors hover:text-[#4a3236] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DDBF8D] focus-visible:ring-offset-4 focus-visible:ring-offset-[#FFFDF8]",
            )}
          >
            Change my response
          </button>
        </motion.div>
      ) : (
        <motion.form key="form" {...fade} onSubmit={submit} noValidate className="space-y-10">
          {status !== "PENDING" && (
            <p className="text-center text-sm text-[#7a5d62]">
              Your current reply is <span className="italic">{statusHeadline[status].toLowerCase()}</span>. Sending
              this form will replace it.
            </p>
          )}

          <div role="radiogroup" aria-label="Will you be attending?" className="grid gap-4 sm:grid-cols-2">
            {choices.map((choice) => {
              const selected = attending === choice.value;
              return (
                <button
                  key={choice.title}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setAttending(choice.value);
                    setError(null);
                  }}
                  className={cn(
                    "relative border px-6 py-7 text-center transition-[color,background-color,border-color,transform] duration-500 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DDBF8D] focus-visible:ring-offset-4 focus-visible:ring-offset-[#FFFDF8]",
                    selected
                      ? "border-[#B76E79] bg-[#F7E3E8]/60 text-[#4a3236]"
                      : "border-[#DDBF8D]/70 text-[#6d4a50] hover:border-[#DDBF8D] hover:bg-[#FFFDF8]",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[#B76E79] bg-[#B76E79] transition-opacity duration-500",
                      selected ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className={cn(displayFont, "block text-2xl")}>{choice.title}</span>
                  <span className={cn(smallCaps, "mt-2 block text-[#9b7b62]")}>{choice.note}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence initial={false}>
            {attending && (
              <motion.div key="attending-details" {...fade} className="grid gap-8 sm:grid-cols-2">
                <Field id="partySize" label="Number in your party">
                  <input
                    id="partySize"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={partySize}
                    onChange={(event) => setPartySize(event.target.value)}
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
                <Field id="mealPreference" label="Meal preference">
                  <input
                    id="mealPreference"
                    value={mealPreference}
                    onChange={(event) => setMealPreference(event.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field id="dietary" label="Dietary restrictions">
                  <input
                    id="dietary"
                    value={dietaryRestrictions}
                    onChange={(event) => setDietaryRestrictions(event.target.value)}
                    className={inputClass}
                  />
                </Field>
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

          {error && (
            <p role="alert" className="text-center text-sm text-[#a2475a]">
              {error}
            </p>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={pending || attending === null}
              className={cn(
                smallCaps,
                "inline-flex w-full items-center justify-center gap-3 bg-[#4a3236] px-8 py-4 text-[11px] text-[#FFFDF8] transition-[background-color,transform,opacity] duration-500 hover:-translate-y-0.5 hover:bg-[#B76E79] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DDBF8D] focus-visible:ring-offset-4 focus-visible:ring-offset-[#FFFDF8] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-[#4a3236]",
              )}
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {pending ? "Sending" : status === "PENDING" ? "Send my reply" : "Update my reply"}
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
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={cn(smallCaps, "block text-[#9b7b62]")}>
        {label}
      </label>
      {children}
    </div>
  );
}
