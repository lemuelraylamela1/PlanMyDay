"use client";

import { useDraggable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  guestDetail,
  guestStatusLabel,
  openSeatsFor,
  partySize,
  sideDotClass,
  sideLabel,
  type SeatGuest,
  type SeatingTableData,
} from "@/features/seating/model";

interface GuestRowProps {
  guest: SeatGuest;
  tables: SeatingTableData[];
  currentTableId: string | null;
  highlighted?: boolean;
  onPlace: (tableId: string | null) => void;
}

export function GuestRow({ guest, tables, currentTableId, highlighted, onPlace }: GuestRowProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: guest.id,
    data: { guest },
  });
  const detail = guestDetail(guest);
  const status = guestStatusLabel(guest);
  const needed = partySize(guest);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex items-center gap-2 rounded-md border bg-card px-2 py-1.5",
        isDragging && "opacity-40",
        highlighted && "border-primary/50 bg-primary/5",
      )}
    >
      <div
        className="flex min-w-0 flex-1 cursor-grab items-center gap-2 touch-none select-none active:cursor-grabbing"
        {...listeners}
        {...attributes}
      >
        <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span
          className={cn("h-2 w-2 shrink-0 rounded-full", sideDotClass(guest.side))}
          title={`${sideLabel(guest.side)} side`}
        />
        <span className="sr-only">{sideLabel(guest.side)} side</span>
        <div className="min-w-0">
          <p className="truncate text-sm" title={guest.name}>
            {guest.name}
          </p>
          {status || detail ? (
            <p className="truncate text-xs" title={[status, detail].filter(Boolean).join(" · ")}>
              {status && (
                <span
                  className={
                    guest.rsvpStatus === "DECLINED"
                      ? "text-destructive"
                      : "text-amber-600 dark:text-amber-400"
                  }
                >
                  {status}
                </span>
              )}
              {status && detail ? <span className="text-muted-foreground"> · </span> : null}
              {detail ? <span className="text-muted-foreground">{detail}</span> : null}
            </p>
          ) : null}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 shrink-0 px-2 text-xs"
            aria-label={currentTableId ? `Move ${guest.name}` : `Seat ${guest.name}`}
            onPointerDown={(event) => event.stopPropagation()}
          >
            {currentTableId ? "Move" : "Seat"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-72 w-56 overflow-y-auto">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Needs {needed} {needed === 1 ? "seat" : "seats"}
          </DropdownMenuLabel>
          {tables.length === 0 ? (
            <DropdownMenuItem disabled>Add a table first</DropdownMenuItem>
          ) : (
            tables.map((table) => {
              const open = openSeatsFor(table, guest.id);
              const here = table.id === currentTableId;
              const canPlace = open >= needed;
              return (
                <DropdownMenuItem
                  key={table.id}
                  disabled={here || !canPlace}
                  onSelect={() => onPlace(table.id)}
                >
                  <span className="flex w-full items-center justify-between gap-3">
                    <span className="truncate">{table.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {here ? "Here" : open <= 0 ? "Full" : `${open} open`}
                    </span>
                  </span>
                </DropdownMenuItem>
              );
            })
          )}
          {currentTableId && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => onPlace(null)}>Unassign</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
