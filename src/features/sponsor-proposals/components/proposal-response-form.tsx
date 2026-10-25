"use client";

import * as React from "react";
import { HeartHandshake, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Fleuron,
  GoldCorner,
  displayFont,
  smallCaps,
} from "@/features/invitations/components/fairytale/ornaments";
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
      <ReplyFrame>
        <Fleuron className="mx-auto" />
        <p className={cn(smallCaps, "mt-5 text-[#B76E79]")}>
          {accepted ? "With love" : "With gratitude"}
        </p>
        <h2 className={cn(displayFont, "mt-4 text-4xl font-light text-[#4a3236] sm:text-5xl")}>
          {accepted ? "You said yes" : "Your reply is with us"}
        </h2>
        <p className="mx-auto mt-4 max-w-md font-serif text-lg italic leading-7 text-[#6d4a50]">
          {accepted
            ? `Thank you for accepting your place as ${rolePhrase}.`
            : "Thank you for letting us know. Your kindness means a great deal."}
        </p>
        {message && (
          <p className="mx-auto mt-6 max-w-md border border-[#DDBF8D]/40 bg-[#FFFDF8] px-5 py-4 font-serif text-lg italic text-[#4a3236]">
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
      </ReplyFrame>
    );
  }

  return (
    <ReplyFrame>
      <Fleuron className="mx-auto" />
      <h2 className={cn(displayFont, "mt-5 text-4xl font-light text-[#4a3236] sm:text-5xl")}>Your response</h2>
      <p className="mt-3 font-serif text-lg italic leading-7 text-[#6d4a50]">
        We would be honored to have you as {rolePhrase}.
      </p>

      <Textarea
        className="mt-7 min-h-28 resize-none border-[#DDBF8D]/60 bg-[#FFFDF8] text-center font-serif text-[#4a3236] placeholder:text-[#9b7b62]/70 focus-visible:ring-[#DDBF8D]"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        maxLength={2000}
        placeholder="A few words for the couple, if you wish"
        aria-label="Personal reply"
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Button
          size="lg"
          className="h-12 bg-[#B76E79] text-xs uppercase tracking-[0.16em] text-[#FFFDF8] hover:bg-[#a25e69]"
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
          className="h-12 border-[#DDBF8D] bg-transparent text-xs uppercase tracking-[0.16em] text-[#8a6248] hover:bg-[#FBF6EE] hover:text-[#6d4a50]"
          disabled={Boolean(pending)}
          onClick={() => respond("DECLINED")}
        >
          {pending === "DECLINED" && <Loader2 className="h-5 w-5 animate-spin" />}
          Kindly decline
        </Button>
      </div>
    </ReplyFrame>
  );
}

function ReplyFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative border border-[#DDBF8D]/55 bg-[#FFFDF8]/75 px-6 py-10 text-center shadow-[0_24px_50px_-36px_rgba(74,50,54,0.45)] sm:px-10 sm:py-12">
      <GoldCorner className="left-2 top-2" />
      <GoldCorner className="right-2 top-2 rotate-90" />
      <GoldCorner className="bottom-2 left-2 -rotate-90" />
      <GoldCorner className="bottom-2 right-2 rotate-180" />
      {children}
    </div>
  );
}
