"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Check,
  Copy,
  Download,
  Loader2,
  QrCode,
  RefreshCw,
  RotateCcw,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import {
  generateCheckInLinkAction,
  getGuestCheckInQrAction,
  regenerateCheckInLinkAction,
  regenerateGuestCheckInQrAction,
  setCheckInEnabledAction,
  undoGuestCheckInAction,
} from "@/features/check-in/actions";
import { downloadQrPng } from "@/features/check-in/components/guest-check-in-qr-card";

export type CheckInGuestRow = {
  id: string;
  fullName: string;
  displayName: string;
  plusOneName: string | null;
  hasCredential: boolean;
  checkedInAt: string | null;
};

interface Props {
  initialEnabled: boolean;
  initialUrl: string | null;
  initialQr: string | null;
  stats: { accepted: number; arrived: number };
  guests: CheckInGuestRow[];
}

export function CheckInDashboardClient({
  initialEnabled,
  initialUrl,
  initialQr,
  stats,
  guests: initialGuests,
}: Props) {
  const [enabled, setEnabled] = React.useState(initialEnabled);
  const [url, setUrl] = React.useState(initialUrl);
  const [qr, setQr] = React.useState(initialQr);
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [guests, setGuests] = React.useState(initialGuests);
  const [preview, setPreview] = React.useState<{
    fullName: string;
    qrDataUrl: string;
  } | null>(null);

  React.useEffect(() => {
    setGuests(initialGuests);
  }, [initialGuests]);

  async function ensureLink() {
    if (url && qr) return;
    setLoading(true);
    const res = await generateCheckInLinkAction();
    setLoading(false);
    if (res.success && res.data) {
      setUrl(res.data.url);
      setQr(res.data.qr);
    } else if (!res.success) {
      toast.error(res.error);
    }
  }

  React.useEffect(() => {
    if (!url) void ensureLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onToggle(checked: boolean) {
    setLoading(true);
    const res = await setCheckInEnabledAction(checked);
    setLoading(false);
    if (res.success) {
      setEnabled(checked);
      toast.success(res.message);
    } else {
      toast.error(res.error);
    }
  }

  async function onRegenerate() {
    if (!confirm("Regenerate the scanner link? Old coordinator links will stop working.")) return;
    setLoading(true);
    const res = await regenerateCheckInLinkAction();
    setLoading(false);
    if (res.success && res.data) {
      setUrl(res.data.url);
      setQr(res.data.qr);
      toast.success("New scanner link generated.");
    } else if (!res.success) {
      toast.error(res.error);
    }
  }

  async function copyUrl() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function openGuestQr(guestId: string) {
    setLoading(true);
    const res = await getGuestCheckInQrAction(guestId);
    setLoading(false);
    if (res.success && res.data) {
      setPreview(res.data);
      setGuests((prev) =>
        prev.map((g) => (g.id === guestId ? { ...g, hasCredential: true } : g)),
      );
    } else if (!res.success) {
      toast.error(res.error);
    }
  }

  async function regenerateGuestQr(guestId: string) {
    if (!confirm("Regenerate this guest QR? Their old code will stop working.")) return;
    setLoading(true);
    const res = await regenerateGuestCheckInQrAction(guestId);
    setLoading(false);
    if (res.success && res.data) {
      setPreview(res.data);
      toast.success("Guest QR regenerated.");
    } else if (!res.success) {
      toast.error(res.error);
    }
  }

  async function undoArrival(guestId: string) {
    setLoading(true);
    const res = await undoGuestCheckInAction(guestId);
    setLoading(false);
    if (res.success) {
      setGuests((prev) =>
        prev.map((g) => (g.id === guestId ? { ...g, checkedInAt: null } : g)),
      );
      toast.success(res.message);
    } else {
      toast.error(res.error);
    }
  }

  const arrivedCount = guests.filter((g) => g.checkedInAt).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Accepted guests</p>
          <p className="mt-1 text-3xl font-semibold">{stats.accepted}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Arrived</p>
          <p className="mt-1 text-3xl font-semibold">
            {arrivedCount}
            <span className="ml-2 text-base font-normal text-muted-foreground">
              / {stats.accepted}
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-6 rounded-lg border p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="checkin-enabled">Coordinator scanner</Label>
            <p className="text-sm text-muted-foreground">
              Share this public link with your coordinator. No PlanMyDay login required.
            </p>
          </div>
          <Switch
            id="checkin-enabled"
            checked={enabled}
            onCheckedChange={onToggle}
            disabled={loading}
          />
        </div>

        {loading && !qr ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          url &&
          qr && (
            <div className="grid gap-6 md:grid-cols-[240px_1fr] md:items-start">
              <div className="flex justify-center md:justify-start">
                <Image
                  src={qr}
                  alt="Coordinator check-in QR"
                  width={220}
                  height={220}
                  className="rounded-lg border"
                  unoptimized
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input readOnly value={url} />
                  <Button variant="outline" size="icon" onClick={copyUrl}>
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={onRegenerate} disabled={loading}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate link
                </Button>
              </div>
            </div>
          )
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Spare guest wedding IDs</h2>
        <p className="text-sm text-muted-foreground">
          Download backup QR codes for accepted guests. Only these codes will pass at the door.
        </p>

        {guests.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No accepted guests yet"
            description="Wedding ID QRs appear here after guests accept their invitation."
          />
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guests.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell>
                      <div className="font-medium">{guest.fullName}</div>
                      {guest.plusOneName ? (
                        <div className="text-xs text-muted-foreground">
                          Plus-one: {guest.plusOneName}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {guest.checkedInAt ? (
                        <Badge variant="success">
                          Arrived{" "}
                          {new Date(guest.checkedInAt).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Not arrived</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={loading}
                          onClick={() => void openGuestQr(guest.id)}
                        >
                          <QrCode className="mr-1 h-4 w-4" />
                          QR
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={loading}
                          onClick={() => void regenerateGuestQr(guest.id)}
                        >
                          <RefreshCw className="mr-1 h-4 w-4" />
                          Regen
                        </Button>
                        {guest.checkedInAt ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={loading}
                            onClick={() => void undoArrival(guest.id)}
                          >
                            <RotateCcw className="mr-1 h-4 w-4" />
                            Undo
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={Boolean(preview)} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wedding ID QR</DialogTitle>
            <DialogDescription>
              Spare printable code for {preview?.fullName}. Guests can also download theirs after
              accepting.
            </DialogDescription>
          </DialogHeader>
          {preview ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <Image
                src={preview.qrDataUrl}
                alt={`QR for ${preview.fullName}`}
                width={240}
                height={240}
                className="rounded-lg border"
                unoptimized
              />
              <p className="font-medium">{preview.fullName}</p>
              <Button
                onClick={() => downloadQrPng(preview.qrDataUrl, preview.fullName)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PNG
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
