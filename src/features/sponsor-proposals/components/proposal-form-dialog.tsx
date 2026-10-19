"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { saveSponsorProposalAction } from "@/features/sponsor-proposals/actions";
import {
  entourageDefaultMessage,
  entourageRoleLabels,
  entourageRoles,
  sponsorProposalSchema,
  type EntourageRole,
  type SponsorProposalInput,
} from "@/features/sponsor-proposals/schemas";

export interface ProposalFormValue extends SponsorProposalInput {
  id?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: ProposalFormValue;
  onSaved: () => void;
}

const emptyProposal: SponsorProposalInput = {
  role: "NINONG_AND_NINANG",
  name: "",
  email: "",
  phone: "",
  customMessage: entourageDefaultMessage("NINONG_AND_NINANG"),
};

export function ProposalFormDialog({
  open,
  onOpenChange,
  initial,
  onSaved,
}: Props) {
  const [pending, setPending] = React.useState(false);
  const isEdit = Boolean(initial?.id);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<SponsorProposalInput>({
    resolver: zodResolver(sponsorProposalSchema),
    defaultValues: emptyProposal,
  });

  React.useEffect(() => {
    if (open) {
      reset(initial ?? emptyProposal);
    }
  }, [open, initial, reset]);

  const role = watch("role");

  function changeRole(next: EntourageRole) {
    const currentMessage = getValues("customMessage");
    const previous = getValues("role");
    setValue("role", next, { shouldValidate: true });
    if (currentMessage === entourageDefaultMessage(previous)) {
      setValue("customMessage", entourageDefaultMessage(next));
    }
  }

  async function onSubmit(values: SponsorProposalInput) {
    setPending(true);
    const result = await saveSponsorProposalAction(initial?.id ?? null, values);
    setPending(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(result.message ?? "Proposal saved.");
    onOpenChange(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit proposal" : "Add entourage"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="proposal-role">Role</Label>
            <Select value={role} onValueChange={(value) => changeRole(value as EntourageRole)}>
              <SelectTrigger id="proposal-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {entourageRoles.map((option) => (
                  <SelectItem key={option} value={option}>
                    {entourageRoleLabels[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="proposal-name">Name</Label>
            <Input
              id="proposal-name"
              placeholder={
                role === "NINONG_AND_NINANG" ? "e.g. Mr. Jason Cruz and wife" : "e.g. Maria Santos"
              }
              {...register("name")}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="proposal-email">Email (optional)</Label>
              <Input id="proposal-email" type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="proposal-phone">Phone (optional)</Label>
              <Input id="proposal-phone" {...register("phone")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposal-message">Personal proposal message</Label>
            <Textarea id="proposal-message" rows={6} {...register("customMessage")} />
            {errors.customMessage && (
              <p className="text-xs text-destructive">{errors.customMessage.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Add proposal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
