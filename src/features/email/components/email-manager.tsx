"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { Mail } from "lucide-react";
import { emailTemplateSchema, type EmailTemplateInput } from "@/features/email/schemas";
import { saveEmailTemplateAction, deleteEmailTemplateAction } from "@/features/email/actions";

export interface EmailTemplateRow {
  id: string;
  name: string;
  kind: EmailTemplateInput["kind"];
  subject: string;
  body: string;
}

interface Props {
  templates: EmailTemplateRow[];
  placeholders: string[];
}

export function EmailManager({ templates, placeholders }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EmailTemplateRow | null>(null);
  const [pending, setPending] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmailTemplateInput>({ resolver: zodResolver(emailTemplateSchema) });

  function openCreate() {
    setEditing(null);
    reset({ name: "", kind: "CUSTOM", subject: "", body: "" });
    setOpen(true);
  }
  function openEdit(t: EmailTemplateRow) {
    setEditing(t);
    reset({ name: t.name, kind: t.kind, subject: t.subject, body: t.body });
    setOpen(true);
  }

  async function onSubmit(values: EmailTemplateInput) {
    setPending(true);
    const res = await saveEmailTemplateAction(editing?.id ?? null, values);
    setPending(false);
    if (res.success) { toast.success(res.message ?? "Saved."); setOpen(false); router.refresh(); }
    else toast.error(res.error);
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this template?")) return;
    const res = await deleteEmailTemplateAction(id);
    if (res.success) { toast.success("Deleted."); router.refresh(); }
    else toast.error(res.error);
  }

  const kind = watch("kind");

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> New template</Button>
      </div>

      {templates.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No email templates"
          description="Create reusable invitation, reminder and thank-you emails."
          action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> New template</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((t) => (
            <Card key={t.id}>
              <CardContent className="space-y-2 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{t.name}</h3>
                    <p className="text-xs text-muted-foreground">{t.subject}</p>
                  </div>
                  <Badge variant="secondary">{t.kind}</Badge>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">{t.body}</p>
                <div className="flex justify-end gap-1 pt-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(t.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit template" : "New email template"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Kind</Label>
                <Select value={kind} onValueChange={(v) => setValue("kind", v as EmailTemplateInput["kind"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INVITATION">Invitation</SelectItem>
                    <SelectItem value="REMINDER">Reminder</SelectItem>
                    <SelectItem value="THANK_YOU">Thank you</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" {...register("subject")} />
              {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea id="body" rows={6} {...register("body")} />
              {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
            </div>
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="mb-1 text-xs font-medium">Available placeholders</p>
              <div className="flex flex-wrap gap-1">
                {placeholders.map((p) => (
                  <code key={p} className="rounded bg-background px-1.5 py-0.5 text-xs">{`{{${p}}}`}</code>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
