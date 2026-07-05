"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Heart, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { switchWeddingAction } from "@/features/weddings/actions";

interface WeddingOption {
  id: string;
  title: string;
}

export function WeddingSwitcher({
  weddings,
  activeId,
}: {
  weddings: WeddingOption[];
  activeId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const active = weddings.find((w) => w.id === activeId);

  async function onSwitch(id: string) {
    if (id === activeId) return;
    setPending(true);
    const res = await switchWeddingAction(id);
    setPending(false);
    if (res.success) {
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between" disabled={pending}>
          <span className="flex items-center gap-2 truncate">
            {pending ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
            ) : (
              <Heart className="h-4 w-4 shrink-0 text-primary" />
            )}
            <span className="truncate">{pending ? "Switching…" : (active?.title ?? "Select wedding")}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56">
        {weddings.map((w) => (
          <DropdownMenuItem key={w.id} onClick={() => onSwitch(w.id)}>
            <Check className={cn("h-4 w-4", w.id === activeId ? "opacity-100" : "opacity-0")} />
            <span className="truncate">{w.title}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/onboarding")}>
          <Plus className="h-4 w-4" /> New wedding
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
