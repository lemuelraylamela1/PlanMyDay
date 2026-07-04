"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { guestSchema, type GuestInput } from "@/features/guests/schemas";
import { createGuestAction, updateGuestAction } from "@/features/guests/actions";

export interface GuestFormValue extends GuestInput {
  id?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: { id: string; name: string }[];
  initial?: GuestFormValue;
}

const emptyGuest: GuestInput = {
  firstName: "",
  lastName: "",
  preferredName: "",
  email: "",
  phone: "",
  side: "BOTH",
  relationship: "",
  rsvpStatus: "PENDING",
  mealPreference: "",
  dietaryRestrictions: "",
  plusOneAllowed: false,
  plusOneName: "",
  groupId: "",
  notes: "",
};

export function GuestFormDialog({ open, onOpenChange, groups, initial }: Props) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const isEdit = Boolean(initial?.id);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GuestInput>({ resolver: zodResolver(guestSchema), defaultValues: emptyGuest });

  React.useEffect(() => {
    if (open) reset(initial ?? emptyGuest);
  }, [open, initial, reset]);

  const plusOneAllowed = watch("plusOneAllowed");
  const side = watch("side");
  const rsvpStatus = watch("rsvpStatus");
  const groupId = watch("groupId");

  async function onSubmit(values: GuestInput) {
    setPending(true);
    const res =
      isEdit && initial?.id
        ? await updateGuestAction(initial.id, values)
        : await createGuestAction(values);
    setPending(false);
    if (res.success) {
      toast.success(res.message ?? "Saved.");
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit guest" : "Add guest"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" {...register("firstName")} />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" {...register("lastName")} />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredName">Preferred name</Label>
              <Input id="preferredName" {...register("preferredName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Input id="relationship" placeholder="e.g. Cousin" {...register("relationship")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
            </div>
            <div className="space-y-2">
              <Label>Side</Label>
              <Select value={side} onValueChange={(v) => setValue("side", v as GuestInput["side"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRIDE">Bride side</SelectItem>
                  <SelectItem value="GROOM">Groom side</SelectItem>
                  <SelectItem value="BOTH">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>RSVP status</Label>
              <Select
                value={rsvpStatus}
                onValueChange={(v) => setValue("rsvpStatus", v as GuestInput["rsvpStatus"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACCEPTED">Accepted</SelectItem>
                  <SelectItem value="DECLINED">Declined</SelectItem>
                  <SelectItem value="TENTATIVE">Tentative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Group</Label>
              <Select
                value={groupId || "none"}
                onValueChange={(v) => setValue("groupId", v === "none" ? "" : v)}
              >
                <SelectTrigger><SelectValue placeholder="No group" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No group</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mealPreference">Meal preference</Label>
              <Input id="mealPreference" {...register("mealPreference")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="dietaryRestrictions">Dietary restrictions</Label>
              <Input id="dietaryRestrictions" {...register("dietaryRestrictions")} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="plusOneAllowed">Plus one allowed</Label>
              <p className="text-xs text-muted-foreground">Let this guest bring a companion.</p>
            </div>
            <Switch
              id="plusOneAllowed"
              checked={plusOneAllowed}
              onCheckedChange={(v) => setValue("plusOneAllowed", v)}
            />
          </div>
          {plusOneAllowed && (
            <div className="space-y-2">
              <Label htmlFor="plusOneName">Plus one name</Label>
              <Input id="plusOneName" {...register("plusOneName")} />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...register("notes")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Add guest"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
