"use client";

import * as React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Search, Users, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GuestRow } from "@/features/seating/components/guest-row";
import {
  guestMatchesQuery,
  groupUnassigned,
  occupiedSeats,
  openSeats,
  SIDE_FILTERS,
  UNASSIGNED_DROP_ID,
  type SeatGuest,
  type SeatingTableData,
  type SideFilter,
} from "@/features/seating/model";

interface UnassignedPanelProps {
  guests: SeatGuest[];
  tables: SeatingTableData[];
  query: string;
  activeGuest: SeatGuest | null;
  onQueryChange: (value: string) => void;
  onPlace: (guestId: string, tableId: string | null) => void;
  onSeatGroup: (guestIds: string[], tableId: string) => void;
}

export function UnassignedPanel({
  guests,
  tables,
  query,
  activeGuest,
  onQueryChange,
  onPlace,
  onSeatGroup,
}: UnassignedPanelProps) {
  const [side, setSide] = React.useState<SideFilter>("ALL");
  const { setNodeRef, isOver } = useDroppable({ id: UNASSIGNED_DROP_ID });
  const canUnassign = activeGuest
    ? tables.some((table) => table.guests.some((guest) => guest.id === activeGuest.id))
    : false;
  const filtering = query.trim().length > 0 || side !== "ALL";
  const filtered = guests.filter(
    (guest) => (side === "ALL" || guest.side === side) && guestMatchesQuery(guest, query),
  );
  const sections = groupUnassigned(filtered, query.trim().length === 0);
  const seatedGuestMatch =
    query.trim().length > 0 &&
    tables.some((table) => table.guests.some((guest) => guestMatchesQuery(guest, query)));

  return (
    <Card
      className={cn(
        "flex flex-col lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-hidden",
        isOver &&
          canUnassign &&
          "bg-primary/5 ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
    >
      <CardHeader className="shrink-0 space-y-3 p-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4" /> Unassigned ({guests.length})
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search guests or tables"
            aria-label="Search guests or tables"
            className={cn("pl-9", query && "pr-8")}
          />
          {query && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div role="radiogroup" aria-label="Filter by side" className="flex flex-wrap gap-1">
          {SIDE_FILTERS.map((option) => {
            const selected = side === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setSide(option.value)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-accent",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {filtering && (
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {guests.length}
          </p>
        )}
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto p-4 pt-0 lg:overscroll-contain">
        <div ref={setNodeRef} className="min-h-24 space-y-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {seatedGuestMatch
                ? "That guest already has a seat. The matching table is highlighted."
                : filtering
                  ? "No unassigned guests match."
                  : "Everyone with an accepted RSVP has a seat."}
            </p>
          ) : (
            sections.map((section) => {
              const needed = occupiedSeats(section.guests);
              const canSeatTogether = section.key !== "individuals" && section.guests.length >= 2;
              return (
                <div
                  key={section.key}
                  className={cn("space-y-2", section.title && "border-l-2 border-border pl-3")}
                >
                  {section.title && (
                    <div className="flex items-center justify-between gap-2">
                      <p className="min-w-0 truncate text-xs font-medium text-muted-foreground">
                        {section.title}
                        <span className="font-normal"> · {needed} seats</span>
                      </p>
                      {canSeatTogether && (
                        <SeatTogetherMenu
                          needed={needed}
                          tables={tables}
                          onSelect={(tableId) =>
                            onSeatGroup(
                              section.guests.map((guest) => guest.id),
                              tableId,
                            )
                          }
                        />
                      )}
                    </div>
                  )}
                  {section.guests.map((guest) => (
                    <GuestRow
                      key={guest.id}
                      guest={guest}
                      tables={tables}
                      currentTableId={null}
                      onPlace={(tableId) => onPlace(guest.id, tableId)}
                    />
                  ))}
                </div>
              );
            })
          )}
          <p className="text-xs text-muted-foreground">
            Drag a guest by the handle, or use Seat. Drop someone here to unassign them.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function SeatTogetherMenu({
  needed,
  tables,
  onSelect,
}: {
  needed: number;
  tables: SeatingTableData[];
  onSelect: (tableId: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-7 shrink-0 px-2 text-xs">
          Seat together
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
            const open = openSeats(table);
            return (
              <DropdownMenuItem
                key={table.id}
                disabled={open < needed}
                onSelect={() => onSelect(table.id)}
              >
                <span className="flex w-full items-center justify-between gap-3">
                  <span className="truncate">{table.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {open <= 0 ? "Full" : `${open} open`}
                  </span>
                </span>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
