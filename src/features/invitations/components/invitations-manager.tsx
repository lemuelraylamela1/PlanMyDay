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
import { generateInviteAction } from "@/features/invitations/actions";

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
  const [invite, setInvite] = React.useState<{ name: string; url: string; qr: string } | null>(null);
  const [copied, setCopied] = React.useState(false);

  async function onView(g: InviteGuestRow) {
    setLoadingId(g.id);
    const res = await generateInviteAction(g.id);
    setLoadingId(null);
    if (res.success && res.data) {
      setInvite({ name: g.name, url: res.data.url, qr: res.data.qr });
      setOpen(true);
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
                Share this secure link or QR code. It identifies the guest by a private token — no
                personal details are exposed in the URL.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
