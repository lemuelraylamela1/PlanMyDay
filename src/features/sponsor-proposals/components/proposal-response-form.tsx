"use client";

import * as React from "react";
import { HeartHandshake, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitProposalResponseAction } from "@/features/sponsor-proposals/actions";

type ResponseStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export function ProposalResponseForm({
  token,
  rolePhrase,
  initialStatus,
  initialMessage,
}: {
  token: string;
  rolePhrase: string;
  initialStatus: ResponseStatus;
  initialMessage: string | null;
}) {
  const [status, setStatus] = React.useState(initialStatus);
  const [message, setMessage] = React.useState(initialMessage ?? "");
  const [editing, setEditing] = React.useState(initialStatus === "PENDING");
  const [pending, setPending] = React.useState<ResponseStatus | null>(null);

  async function respond(nextStatus: "ACCEPTED" | "DECLINED") {
    setPending(nextStatus);
    const result = await submitProposalResponseAction({
      token,
      status: nextStatus,
      responseMessage: message,
    });
    setPending(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setStatus(nextStatus);
    setEditing(false);
    toast.success(result.message ?? "Your response was saved.");
  }

  if (!editing && status !== "PENDING") {
    const accepted = status === "ACCEPTED";
    return (
      <div className="rounded-3xl border border-[#E8B8C7] bg-white px-6 py-10 text-center shadow-sm sm:px-10">
        <p className="text-xs uppercase tracking-[0.28em] text-[#DDBF8D]">
          {accepted ? "With love" : "With gratitude"}
        </p>
        <h2 className="mt-4 font-serif text-4xl text-[#B76E79]">
          {accepted ? "You said yes" : "Your reply is with us"}
        </h2>
        <p className="mx-auto mt-4 max-w-md leading-7 text-[#8d5d66]">
          {accepted
            ? `Thank you for accepting your place as ${rolePhrase}.`
            : "Thank you for letting us know. Your kindness means a great deal."}
        </p>
        {message && (
          <p className="mx-auto mt-6 max-w-md rounded-2xl bg-[#F7E3E8] px-5 py-4 font-serif text-lg italic text-[#6d4650]">
            “{message}”
          </p>
        )}
        <Button
          variant="ghost"
          className="mt-6 text-[#B76E79] hover:bg-[#F7E3E8] hover:text-[#B76E79]"
          onClick={() => setEditing(true)}
        >
          Change response
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#E8B8C7] bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10">
      <div className="text-center">
        <h2 className="font-serif text-4xl text-[#B76E79]">Your response</h2>
        <p className="mt-3 text-sm leading-6 text-[#8d5d66]">
          We would be honored to have you as {rolePhrase}.
        </p>
      </div>

      <Textarea
        className="mt-7 min-h-28 resize-none border-[#E8B8C7] bg-[#FFFDF8] text-[#5c3d43] placeholder:text-[#B76E79]/50 focus-visible:ring-[#DDBF8D]"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        maxLength={2000}
        placeholder="Add a personal message for the couple (optional)"
        aria-label="Personal reply"
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Button
          size="lg"
          className="h-12 bg-[#B76E79] text-[#FFFDF8] hover:bg-[#a25e69]"
          disabled={Boolean(pending)}
          onClick={() => respond("ACCEPTED")}
        >
          {pending === "ACCEPTED"
            ? <Loader2 className="h-5 w-5 animate-spin" />
            : <HeartHandshake className="h-5 w-5" />}
          Accept with joy
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-12 border-[#E8B8C7] bg-transparent text-[#B76E79] hover:bg-[#F7E3E8] hover:text-[#B76E79]"
          disabled={Boolean(pending)}
          onClick={() => respond("DECLINED")}
        >
          {pending === "DECLINED" && <Loader2 className="h-5 w-5 animate-spin" />}
          Kindly decline
        </Button>
      </div>
    </div>
  );
}
