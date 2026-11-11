"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { QrCode, Copy, Loader2, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { MailOpen } from "lucide-react";
import {
  generateInviteAction,
  regenerateInviteAction,
} from "@/features/invitations/actions";

export interface InviteGuestRow {
  id: string;
  name: string;
  email: string | null;
  invitationStatus: "NOT_SENT" | "SENT";
  rsvpStatus: "PENDING" | "ACCEPTED" | "DECLINED" | "TENTATIVE";
  hasToken: boolean;
}

const inviteVariant: Record<InviteGuestRow["invitationStatus"], "secondary" | "info"> = {
  NOT_SENT: "secondary",
  SENT: "info",
};

export function InvitationsManager({ guests }: { guests: InviteGuestRow[] }) {
  const [open, setOpen] = React.useState(false);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [invite, setInvite] = React.useState<{
    name: string;
    url: string;
    qr: string;
    guestId: string;
  } | null>(null);
  const [copied, setCopied] = React.useState(false);

  async function onView(g: InviteGuestRow) {
    setLoadingId(g.id);
    const res = await generateInviteAction(g.id);
    setLoadingId(null);
    if (res.success && res.data) {
      setInvite({ name: g.name, url: res.data.url, qr: res.data.qr, guestId: g.id });
      setOpen(true);
    } else if (!res.success) {
      toast.error(res.error);
    }
  }

  async function onRegenerate() {
    if (!invite) return;
    if (
      !confirm(
        "Generate a new invitation link? The previous link and QR code will stop working.",
      )
    ) {
      return;
    }
    setLoadingId(invite.guestId);
    const res = await regenerateInviteAction(invite.guestId);
    setLoadingId(null);
    if (res.success && res.data) {
      setInvite({ ...invite, url: res.data.url, qr: res.data.qr });
      setCopied(false);
      toast.success("New invitation link generated.");
    } else if (!res.success) {
      toast.error(res.error);
    }
  }

  async function copyUrl() {
    if (!invite) return;
    await navigator.clipboard.writeText(invite.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (guests.length === 0) {
    return (
      <EmptyState
        icon={MailOpen}
        title="No guests to invite"
        description="Add guests first, then generate personalized invitation links here."
      />
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Invite</TableHead>
              <TableHead>RSVP</TableHead>
              <TableHead className="text-right">Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.map((g) => (
              <TableRow key={g.id}>
                <TableCell className="font-medium">{g.name}</TableCell>
                <TableCell className="hidden md:table-cell">{g.email ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={inviteVariant[g.invitationStatus]}>
                    {g.invitationStatus.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{g.rsvpStatus}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => onView(g)} disabled={loadingId === g.id}>
                    {loadingId === g.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <QrCode className="h-4 w-4" />
                    )}
                    Invite
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitation for {invite?.name}</DialogTitle>
          </DialogHeader>
          {invite && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Image
                  src={invite.qr}
                  alt="Invitation QR code"
                  width={220}
                  height={220}
                  className="rounded-lg border"
                  unoptimized
                />
              </div>
              <div className="flex items-center gap-2">
                <Input readOnly value={invite.url} />
                <Button variant="outline" size="icon" onClick={copyUrl}>
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This link stays valid until you generate a new one for this guest. Share the URL or
                QR code — the guest name in the path is for sharing; access still requires the
                private token.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={onRegenerate}
                disabled={loadingId === invite.guestId}
              >
                {loadingId === invite.guestId ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Generate new link
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
