"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { HandHeart, Loader2, User } from "lucide-react";

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
import {
  GUEST_TITLE_OPTIONS,
  PRINCIPAL_SPONSOR,
  SPONSOR_PARTNER_PLACEHOLDER,
  composeSponsorPairName,
  isPrincipalSponsor,
  splitTitledName,
} from "@/features/guests/display-name";
import { cn } from "@/lib/utils";
import { createGuestAction, updateGuestAction } from "@/features/guests/actions";

export interface GuestFormValue extends GuestInput {
  id?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: { id: string; name: string }[];
  initial?: GuestFormValue;
  /** Which format a new entry opens in. Edits follow the saved guest. */
  defaultMode?: GuestFormMode;
}

export type GuestFormMode = "guest" | "sponsor";

function TitleSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: GuestInput["title"]) => void;
}) {
  return (
    <Select
      value={value || "none"}
      onValueChange={(v) => onChange(v === "none" ? "" : (v as GuestInput["title"]))}
    >
      <SelectTrigger>
        <SelectValue placeholder="Optional" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No title</SelectItem>
        {GUEST_TITLE_OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const emptyGuest: GuestInput = {
  title: "",
  firstName: "",
  lastName: "",
  preferredName: "",
  email: "",
  phone: "",
  facebookLink: "",
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

export function GuestFormDialog({
  open,
  onOpenChange,
  groups,
  initial,
  defaultMode = "guest",
}: Props) {
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

  const [mode, setMode] = React.useState<GuestFormMode>("guest");
  const [ninangTitle, setNinangTitle] = React.useState<GuestInput["title"]>("Mrs.");
  const [ninangName, setNinangName] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    const startMode: GuestFormMode = initial
      ? isPrincipalSponsor(initial)
        ? "sponsor"
        : "guest"
      : defaultMode;
    setMode(startMode);
    if (startMode === "sponsor") {
      const stored = initial?.plusOneName?.trim() === SPONSOR_PARTNER_PLACEHOLDER ? "" : initial?.plusOneName;
      const ninang = splitTitledName(stored);
      setNinangTitle(initial ? ninang.title : "Mrs.");
      setNinangName(ninang.name);
      reset(initial ?? { ...emptyGuest, title: "Mr.", relationship: PRINCIPAL_SPONSOR });
    } else {
      setNinangTitle("Mrs.");
      setNinangName("");
      reset(initial ?? emptyGuest);
    }
  }, [open, initial, defaultMode, reset]);

  const plusOneAllowed = watch("plusOneAllowed");
  const side = watch("side");
  const rsvpStatus = watch("rsvpStatus");
  const groupId = watch("groupId");
  const title = watch("title");

  const isSponsor = mode === "sponsor";
  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const preferredName = watch("preferredName");
  const ninangFull = [ninangTitle, ninangName.trim()].filter(Boolean).join(" ");
  const pairPreview = composeSponsorPairName(
    [title, firstName?.trim(), lastName?.trim()].filter(Boolean).join(" "),
    ninangFull,
  );

  function switchMode(next: GuestFormMode) {
    if (next === mode || isEdit) return;
    setMode(next);
    if (next === "sponsor") {
      if (!title) setValue("title", "Mr.");
      setValue("relationship", PRINCIPAL_SPONSOR);
    } else if (isPrincipalSponsor({ relationship: watch("relationship") })) {
      setValue("relationship", "");
    }
  }

  async function onSubmit(formValues: GuestInput) {
    let values = formValues;
    if (isSponsor) {
      values = {
        ...formValues,
        relationship: PRINCIPAL_SPONSOR,
        plusOneAllowed: true,
        plusOneName: ninangName.trim() ? ninangFull : SPONSOR_PARTNER_PLACEHOLDER,
      };
    }
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
          <DialogTitle>
            {isSponsor
              ? isEdit
                ? "Edit principal sponsors"
                : "Add principal sponsors"
              : isEdit
                ? "Edit guest"
                : "Add guest"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Format switch: one person, or a Ninong & Ninang pair on one invite */}
          <div className="grid grid-cols-2 gap-1 rounded-lg border bg-muted/40 p-1">
            {(
              [
                { key: "guest", label: "Guest", hint: "One person", icon: User },
                {
                  key: "sponsor",
                  label: "Principal sponsor",
                  hint: "Ninong & Ninang · 1 QR",
                  icon: HandHeart,
                },
              ] as const
            ).map((option) => {
              const active = mode === option.key;
              const locked = isEdit && !active;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => switchMode(option.key)}
                  disabled={locked}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-left transition-colors",
                    active
                      ? "bg-card shadow-sm ring-1 ring-border"
                      : "text-muted-foreground hover:text-foreground",
                    locked && "cursor-not-allowed opacity-40 hover:text-muted-foreground",
                  )}
                >
                  <option.icon className={cn("h-4 w-4 shrink-0", active && "text-gold")} />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium leading-tight">{option.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {option.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {isSponsor && (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <fieldset className="space-y-3 rounded-lg border p-3">
                  <legend className="px-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Ninong <span className="normal-case tracking-normal">(optional)</span>
                  </legend>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <TitleSelect value={title ?? ""} onChange={(v) => setValue("title", v)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" {...register("firstName")} />
                    {errors.firstName && (
                      <p className="text-xs text-destructive">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" {...register("lastName")} />
                    {errors.lastName && (
                      <p className="text-xs text-destructive">{errors.lastName.message}</p>
                    )}
                  </div>
                </fieldset>

                <fieldset className="space-y-3 rounded-lg border p-3">
                  <legend className="px-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Ninang <span className="normal-case tracking-normal">(optional)</span>
                  </legend>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <TitleSelect value={ninangTitle ?? ""} onChange={(v) => setNinangTitle(v)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ninangName">Full name</Label>
                    <Input
                      id="ninangName"
                      placeholder="e.g. Maria Dela Cruz"
                      value={ninangName}
                      onChange={(e) => setNinangName(e.target.value)}
                    />
                  </div>
                </fieldset>
              </div>

              <div className="space-y-2 rounded-lg border border-dashed p-3">
                <div className="flex items-baseline justify-between gap-3">
                  <Label htmlFor="preferredName">
                    Name on invitation <span className="text-destructive">*</span>
                  </Label>
                  {pairPreview && !preferredName?.trim() ? (
                    <button
                      type="button"
                      className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                      onClick={() =>
                        setValue("preferredName", pairPreview, { shouldValidate: true })
                      }
                    >
                      Use &ldquo;{pairPreview}&rdquo;
                    </button>
                  ) : null}
                </div>
                <Input
                  id="preferredName"
                  placeholder="e.g. Mr. & Mrs. Juan Dela Cruz"
                  aria-invalid={Boolean(errors.preferredName)}
                  {...register("preferredName")}
                />
                {errors.preferredName ? (
                  <p className="text-xs text-destructive">{errors.preferredName.message}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    This is the greeting on their invite. All other fields are optional. One
                    link and one QR admits both (party of 2).
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {!isSponsor && (
              <>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <TitleSelect value={title ?? ""} onChange={(v) => setValue("title", v)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredName">Preferred name</Label>
                  <Input id="preferredName" {...register("preferredName")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" {...register("firstName")} />
                  {errors.firstName && (
                    <p className="text-xs text-destructive">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" {...register("lastName")} />
                  {errors.lastName && (
                    <p className="text-xs text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input id="relationship" placeholder="e.g. Cousin" {...register("relationship")} />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="facebookLink">Facebook link</Label>
              <Input
                id="facebookLink"
                type="url"
                placeholder="https://facebook.com/..."
                {...register("facebookLink")}
              />
              {errors.facebookLink && (
                <p className="text-xs text-destructive">{errors.facebookLink.message}</p>
              )}
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
            {!isSponsor && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="mealPreference">Meal preference</Label>
                  <Input id="mealPreference" {...register("mealPreference")} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="dietaryRestrictions">Dietary restrictions</Label>
                  <Input id="dietaryRestrictions" {...register("dietaryRestrictions")} />
                </div>
              </>
            )}
          </div>

          {!isSponsor && (
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
          )}
          {!isSponsor && plusOneAllowed && (
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
              {isEdit ? "Save changes" : isSponsor ? "Add sponsors" : "Add guest"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
