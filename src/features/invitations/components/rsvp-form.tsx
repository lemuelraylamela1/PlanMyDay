"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, PartyPopper } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitRsvpAction } from "@/features/invitations/actions";

interface Props {
  weddingId: string;
  guestId: string;
  guestName: string;
  plusOneAllowed: boolean;
}

export function RsvpForm({ weddingId, guestId, guestName, plusOneAllowed }: Props) {
  const [attending, setAttending] = React.useState<boolean | null>(null);
  const [pending, setPending] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [partySize, setPartySize] = React.useState(1);
  const [mealPreference, setMealPreference] = React.useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = React.useState("");
  const [plusOneName, setPlusOneName] = React.useState("");
  const [message, setMessage] = React.useState("");

  async function submit() {
    if (attending === null) {
      toast.error("Please let us know if you can make it.");
      return;
    }
    setPending(true);
    const res = await submitRsvpAction({
      weddingId,
      guestId,
      attending,
      partySize,
      mealPreference,
      dietaryRestrictions,
      plusOneName,
      message,
    });
    setPending(false);
    if (res.success) {
      setDone(true);
      toast.success(res.message ?? "RSVP recorded.");
    } else {
      toast.error(res.error);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <PartyPopper className="h-12 w-12 text-primary" />
        <h2 className="text-xl font-semibold">Thank you, {guestName}!</h2>
        <p className="text-sm text-muted-foreground">
          Your response has been recorded. We can&apos;t wait to celebrate with you.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant={attending === true ? "default" : "outline"}
          onClick={() => setAttending(true)}
        >
          Joyfully accept
        </Button>
        <Button
          type="button"
          variant={attending === false ? "default" : "outline"}
          onClick={() => setAttending(false)}
        >
          Regretfully decline
        </Button>
      </div>

      {attending && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="partySize">Number in your party</Label>
            <Input
              id="partySize"
              type="number"
              min={1}
              value={partySize}
              onChange={(e) => setPartySize(Number(e.target.value))}
            />
          </div>
          {plusOneAllowed && (
            <div className="space-y-2">
              <Label htmlFor="plusOneName">Plus one name</Label>
              <Input id="plusOneName" value={plusOneName} onChange={(e) => setPlusOneName(e.target.value)} />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="mealPreference">Meal preference</Label>
            <Input id="mealPreference" value={mealPreference} onChange={(e) => setMealPreference(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dietary">Dietary restrictions</Label>
            <Input id="dietary" value={dietaryRestrictions} onChange={(e) => setDietaryRestrictions(e.target.value)} />
          </div>
        </div>
      )}

      {attending !== null && (
        <div className="space-y-2">
          <Label htmlFor="message">A note for the couple (optional)</Label>
          <Textarea id="message" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
      )}

      <Button onClick={submit} className="w-full" disabled={pending || attending === null}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Send RSVP
      </Button>
    </div>
  );
}
