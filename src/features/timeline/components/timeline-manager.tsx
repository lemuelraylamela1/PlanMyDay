"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, MapPin, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { timelineEventSchema, type TimelineEventInput } from "@/features/timeline/schemas";
import {
  saveTimelineEventAction,
  deleteTimelineEventAction,
} from "@/features/timeline/actions";

export interface TimelineRow {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startTime: string;
  endTime: string | null;
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export function TimelineManager({ events }: { events: TimelineRow[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TimelineRow | null>(null);
  const [pending, setPending] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TimelineEventInput>({ resolver: zodResolver(timelineEventSchema) });

  function openCreate() {
    setEditing(null);
    reset({ title: "", description: "", location: "", startTime: "", endTime: "" });
    setOpen(true);
  }
  function openEdit(e: TimelineRow) {
    setEditing(e);
    reset({
      title: e.title,
      description: e.description ?? "",
      location: e.location ?? "",
      startTime: e.startTime.slice(0, 16),
      endTime: e.endTime ? e.endTime.slice(0, 16) : "",
    });
    setOpen(true);
  }

  async function onSubmit(values: TimelineEventInput) {
    setPending(true);
    const res = await saveTimelineEventAction(editing?.id ?? null, values);
    setPending(false);
    if (res.success) { toast.success(res.message ?? "Saved."); setOpen(false); router.refresh(); }
    else toast.error(res.error);
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    const res = await deleteTimelineEventAction(id);
    if (res.success) { toast.success("Deleted."); router.refresh(); }
    else toast.error(res.error);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add event</Button>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No events yet"
          description="Build your wedding-day schedule from preparation to after party."
          action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add event</Button>}
        />
      ) : (
        <div className="relative space-y-0 border-l pl-6">
          {events.map((e) => (
            <div key={e.id} className="relative pb-6">
              <span className="absolute -left-[1.72rem] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary bg-background" />
              <div className="flex items-start justify-between gap-3 rounded-lg border p-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-primary">{formatTime(e.startTime)}
                    {e.endTime && ` – ${formatTime(e.endTime)}`}
                  </p>
                  <p className="font-semibold">{e.title}</p>
                  {e.description && <p className="text-sm text-muted-foreground">{e.description}</p>}
                  {e.location && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {e.location}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(e)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(e.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit event" : "Add event"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="e.g. Ceremony" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={2} {...register("description")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register("location")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start</Label>
                <Input id="startTime" type="datetime-local" {...register("startTime")} />
                {errors.startTime && <p className="text-xs text-destructive">{errors.startTime.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End</Label>
                <Input id="endTime" type="datetime-local" {...register("endTime")} />
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
