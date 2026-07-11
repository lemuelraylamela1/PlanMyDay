"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Copy, Loader2, Check, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  generateUploadLinkAction,
  regenerateUploadLinkAction,
  setUploadEnabledAction,
} from "@/features/guest-uploads/actions";

interface Props {
  initialEnabled: boolean;
  initialUrl: string | null;
  initialQr: string | null;
}

export function UploadSharePanel({ initialEnabled, initialUrl, initialQr }: Props) {
  const [enabled, setEnabled] = React.useState(initialEnabled);
  const [url, setUrl] = React.useState(initialUrl);
  const [qr, setQr] = React.useState(initialQr);
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  async function ensureLink() {
    if (url && qr) return;
    setLoading(true);
    const res = await generateUploadLinkAction();
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
    const res = await setUploadEnabledAction(checked);
    setLoading(false);
    if (res.success) {
      setEnabled(checked);
      toast.success(res.message);
    } else {
      toast.error(res.error);
    }
  }

  async function onRegenerate() {
    if (!confirm("Regenerate the upload link? Old QR codes will stop working.")) return;
    setLoading(true);
    const res = await regenerateUploadLinkAction();
    setLoading(false);
    if (res.success && res.data) {
      setUrl(res.data.url);
      setQr(res.data.qr);
      toast.success("New upload link generated.");
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-1">
          <Label htmlFor="upload-enabled">Accept guest uploads</Label>
          <p className="text-sm text-muted-foreground">
            When off, guests see &quot;Upload is no longer available&quot;.
          </p>
        </div>
        <Switch
          id="upload-enabled"
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
          <div className="space-y-4 rounded-lg border p-6">
            <div className="flex justify-center">
              <Image
                src={qr}
                alt="Guest upload QR code"
                width={240}
                height={240}
                className="rounded-lg border"
                unoptimized
              />
            </div>
            <div className="flex items-center gap-2">
              <Input readOnly value={url} />
              <Button variant="outline" size="icon" onClick={copyUrl}>
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Print this QR code at your venue so guests can upload photos and videos without an
              account.
            </p>
            <Button variant="outline" size="sm" onClick={onRegenerate} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Regenerate link
            </Button>
          </div>
        )
      )}
    </div>
  );
}
